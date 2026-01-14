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

import java.time.LocalDateTime;
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
    private final CartService cartService;

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
        // Get user's cart
        ShoppingCart cart = cartRepository.findByUserIdWithItemsAndBooks(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found for user"));

        if (cart.getItems().isEmpty()) {
            throw new BadRequestException("Cannot checkout with an empty cart");
        }

        // Validate stock availability for all items
        for (CartItem cartItem : cart.getItems()) {
            Book book = cartItem.getBook();
            if (book.getQuantity() < cartItem.getQuantity()) {
                throw new InsufficientStockException(
                        "Insufficient stock for book: " + book.getTitle() + 
                        ". Available: " + book.getQuantity() + ", Requested: " + cartItem.getQuantity());
            }
        }

        // Create order
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Order order = Order.builder()
                .orderNumber(generateOrderNumber())
                .user(user)
                .status(OrderStatus.PENDING)
                .shippingAddress(request.getShippingAddress())
                .paymentMethod("CASH_ON_DELIVERY")
                .notes(request.getNotes())
                .build();

        // Create order items and update inventory
        for (CartItem cartItem : cart.getItems()) {
            Book book = cartItem.getBook();
            
            OrderItem orderItem = OrderItem.builder()
                    .book(book)
                    .quantity(cartItem.getQuantity())
                    .priceAtPurchase(book.getPrice())
                    .build();
            
            order.addItem(orderItem);

            // Reduce book quantity
            book.setQuantity(book.getQuantity() - cartItem.getQuantity());
            bookRepository.save(book);
        }

        // Calculate totals
        order.calculateTotals();

        // Save order
        order = orderRepository.save(order);

        // Clear the cart
        cartService.clearCart(userId);

        return OrderResponse.fromEntity(order);
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

        // Update timestamps based on status
        if (newStatus == OrderStatus.SHIPPED) {
            order.setShippedAt(LocalDateTime.now());
            if (request.getTrackingNumber() != null) {
                order.setTrackingNumber(request.getTrackingNumber());
            }
        } else if (newStatus == OrderStatus.DELIVERED) {
            order.setDeliveredAt(LocalDateTime.now());
        } else if (newStatus == OrderStatus.CANCELLED) {
            // Restore inventory
            for (OrderItem item : order.getItems()) {
                Book book = item.getBook();
                book.setQuantity(book.getQuantity() + item.getQuantity());
                bookRepository.save(book);
            }
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
        // Define valid transitions
        boolean valid = switch (from) {
            case PENDING -> to == OrderStatus.PROCESSING || to == OrderStatus.CANCELLED;
            case PROCESSING -> to == OrderStatus.SHIPPED || to == OrderStatus.CANCELLED;
            case SHIPPED -> to == OrderStatus.DELIVERED;
            case DELIVERED, CANCELLED -> false;
        };

        if (!valid) {
            throw new BadRequestException("Invalid status transition from " + from + " to " + to);
        }
    }
}
