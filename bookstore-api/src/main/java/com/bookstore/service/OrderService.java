package com.bookstore.service;

import com.bookstore.dto.request.CheckoutRequest;
import com.bookstore.dto.request.UpdateOrderStatusRequest;
import com.bookstore.dto.response.OrderResponse;
import com.bookstore.dto.response.PageResponse;
import com.bookstore.entity.*;
import com.bookstore.exception.BookstoreExceptions.*;
import com.bookstore.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final ShoppingCartRepository cartRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final CartItemRepository cartItemRepository;

    public OrderResponse getOrderById(Long orderId, Long userId) {
        Order order = orderRepository.findByIdWithItems(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        // Check if user is authorized to view this order
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!order.getUser().getId().equals(userId) &&
                user.getRole() != Role.MANAGER &&
                user.getRole() != Role.ADMINISTRATOR) {
            throw new ForbiddenException("You are not authorized to view this order");
        }

        return OrderResponse.fromEntity(order);
    }

    public OrderResponse getOrderByOrderNumber(String orderNumber, Long userId) {
        Order order = orderRepository.findByOrderNumberWithItems(orderNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with order number: " + orderNumber));

        // Check authorization
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!order.getUser().getId().equals(userId) &&
                user.getRole() != Role.MANAGER &&
                user.getRole() != Role.ADMINISTRATOR) {
            throw new ForbiddenException("You are not authorized to view this order");
        }

        return OrderResponse.fromEntity(order);
    }

    public List<OrderResponse> getOrderHistory(Long userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(OrderResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public PageResponse<OrderResponse> getUserOrders(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<OrderResponse> orderPage = orderRepository.findByUserId(userId, pageable)
                .map(OrderResponse::fromEntity);
        return PageResponse.fromPage(orderPage);
    }

    public PageResponse<OrderResponse> getAllOrders(int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<OrderResponse> orderPage = orderRepository.findAll(pageable)
                .map(OrderResponse::fromEntity);
        return PageResponse.fromPage(orderPage);
    }

    public PageResponse<OrderResponse> getOrdersByStatus(OrderStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<OrderResponse> orderPage = orderRepository.findByStatus(status, pageable)
                .map(OrderResponse::fromEntity);
        return PageResponse.fromPage(orderPage);
    }

    @Transactional
    public OrderResponse checkout(Long userId, CheckoutRequest request) {
        // Get user's cart with items and books
        ShoppingCart cart = cartRepository.findByUserIdWithItemsAndBooks(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found for user"));

        if (cart.getItems().isEmpty()) {
            throw new BadRequestException("Cannot checkout with an empty cart");
        }

        // Copy cart items data before any modifications to avoid entity state issues
        List<CartItemData> cartItemsData = new ArrayList<>();
        for (CartItem cartItem : cart.getItems()) {
            Book book = cartItem.getBook();

            // Validate stock availability
            if (book.getQuantity() < cartItem.getQuantity()) {
                throw new InsufficientStockException(
                        "Insufficient stock for book: " + book.getTitle() +
                                ". Available: " + book.getQuantity() + ", Requested: " + cartItem.getQuantity());
            }

            // Store the data we need
            cartItemsData.add(new CartItemData(
                    book.getId(),
                    book.getTitle(),
                    book.getAuthor(),
                    book.getIsbn(),
                    book.getPrice(),
                    cartItem.getQuantity(),
                    book.getQuantity() // current stock
            ));
        }

        // Store cart ID for later cleanup
        Long cartId = cart.getId();

        // Get user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Create order
        Order order = Order.builder()
                .orderNumber(generateOrderNumber())
                .user(user)
                .status(OrderStatus.PENDING)
                .shippingAddress(request.getShippingAddress())
                .paymentMethod("CASH_ON_DELIVERY")
                .notes(request.getNotes())
                .subtotal(BigDecimal.ZERO)
                .tax(BigDecimal.ZERO)
                .shippingCost(BigDecimal.ZERO)
                .total(BigDecimal.ZERO)
                .build();

        // Create order items and update inventory using the copied data
        for (CartItemData itemData : cartItemsData) {
            Book book = bookRepository.findById(itemData.bookId)
                    .orElseThrow(() -> new ResourceNotFoundException("Book not found"));

            OrderItem orderItem = OrderItem.builder()
                    .book(book)
                    .quantity(itemData.quantity)
                    .priceAtPurchase(itemData.price)
                    .build();

            order.addItem(orderItem);

            // Reduce book quantity
            book.setQuantity(book.getQuantity() - itemData.quantity);
            bookRepository.save(book);
        }

        // Calculate totals
        order.calculateTotals();

        // Save order first
        order = orderRepository.save(order);

        // Store order ID
        Long orderId = order.getId();

        // Clear the cart using direct delete query only (don't touch the managed cart entity)
        cartItemRepository.deleteAllByCartId(cartId);

        // Fetch the saved order with items for response
        Order savedOrder = orderRepository.findByIdWithItems(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found after save"));

        return OrderResponse.fromEntity(savedOrder);
    }

    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, UpdateOrderStatusRequest request) {
        Order order = orderRepository.findByIdWithItems(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        OrderStatus oldStatus = order.getStatus();
        OrderStatus newStatus = request.getStatus();

        // Validate status transition
        validateStatusTransition(oldStatus, newStatus);

        order.setStatus(newStatus);

        // Update timestamps and handle inventory based on status transitions
        switch (newStatus) {
            case PENDING:
                // Clear all progress timestamps when reverting to pending
                order.setShippedAt(null);
                order.setDeliveredAt(null);
                order.setTrackingNumber(null);
                order.setShippingCarrier(null);
                break;
            case PROCESSING:
                // Clear shipping/delivery timestamps when reverting to processing
                order.setShippedAt(null);
                order.setDeliveredAt(null);
                order.setTrackingNumber(null);
                order.setShippingCarrier(null);
                break;
            case SHIPPED:
                order.setShippedAt(LocalDateTime.now());
                order.setDeliveredAt(null); // Clear delivery timestamp if reverting from delivered
                if (request.getShippingCarrier() != null) {
                    order.setShippingCarrier(request.getShippingCarrier());
                }
                if (request.getTrackingNumber() != null) {
                    order.setTrackingNumber(request.getTrackingNumber());
                }
                break;
            case DELIVERED:
                order.setDeliveredAt(LocalDateTime.now());
                break;
            case CANCELLED:
                // Restore inventory when cancelling
                for (OrderItem item : order.getItems()) {
                    Book book = item.getBook();
                    book.setQuantity(book.getQuantity() + item.getQuantity());
                    bookRepository.save(book);
                }
                break;
        }

        if (request.getNotes() != null) {
            order.setNotes(request.getNotes());
        }

        order = orderRepository.save(order);
        return OrderResponse.fromEntity(order);
    }

    @Transactional
    public OrderResponse cancelOrder(Long orderId, Long userId) {
        Order order = orderRepository.findByIdWithItems(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        // Check authorization
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!order.getUser().getId().equals(userId) &&
                user.getRole() != Role.MANAGER &&
                user.getRole() != Role.ADMINISTRATOR) {
            throw new ForbiddenException("You are not authorized to cancel this order");
        }

        // Only pending or processing orders can be cancelled
        if (order.getStatus() != OrderStatus.PENDING && order.getStatus() != OrderStatus.PROCESSING) {
            throw new BadRequestException("Order cannot be cancelled. Current status: " + order.getStatus());
        }

        // Restore inventory
        for (OrderItem item : order.getItems()) {
            Book book = item.getBook();
            book.setQuantity(book.getQuantity() + item.getQuantity());
            bookRepository.save(book);
        }

        order.setStatus(OrderStatus.CANCELLED);
        order = orderRepository.save(order);

        return OrderResponse.fromEntity(order);
    }

    private String generateOrderNumber() {
        return "ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private void validateStatusTransition(OrderStatus from, OrderStatus to) {
        // Don't allow transitioning to the same status
        if (from == to) {
            throw new BadRequestException("Order is already in " + from + " status");
        }
        
        // Allow flexible transitions for managers/admins
        // Only restriction: cannot transition FROM cancelled (inventory already restored)
        if (from == OrderStatus.CANCELLED) {
            throw new BadRequestException("Cannot change status of a cancelled order. Inventory has already been restored.");
        }
    }

    // Inner class to hold cart item data temporarily
    private static class CartItemData {
        final Long bookId;
        final String title;
        final String author;
        final String isbn;
        final BigDecimal price;
        final int quantity;
        final int currentStock;

        CartItemData(Long bookId, String title, String author, String isbn,
                     BigDecimal price, int quantity, int currentStock) {
            this.bookId = bookId;
            this.title = title;
            this.author = author;
            this.isbn = isbn;
            this.price = price;
            this.quantity = quantity;
            this.currentStock = currentStock;
        }
    }
}