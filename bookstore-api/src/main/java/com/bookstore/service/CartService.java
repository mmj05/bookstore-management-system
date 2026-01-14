package com.bookstore.service;

import com.bookstore.dto.request.CartItemRequest;
import com.bookstore.dto.response.CartResponse;
import com.bookstore.entity.Book;
import com.bookstore.entity.CartItem;
import com.bookstore.entity.ShoppingCart;
import com.bookstore.entity.User;
import com.bookstore.exception.BookstoreExceptions.*;
import com.bookstore.repository.BookRepository;
import com.bookstore.repository.CartItemRepository;
import com.bookstore.repository.ShoppingCartRepository;
import com.bookstore.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CartService {

    private final ShoppingCartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;

    public CartResponse getCart(Long userId) {
        ShoppingCart cart = getOrCreateCart(userId);
        return CartResponse.fromEntity(cart);
    }

    @Transactional
    public CartResponse addItem(Long userId, CartItemRequest request) {
        ShoppingCart cart = getOrCreateCart(userId);
        
        Book book = bookRepository.findById(request.getBookId())
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + request.getBookId()));

        // Check stock availability
        if (book.getQuantity() < request.getQuantity()) {
            throw new InsufficientStockException(
                    "Insufficient stock for book: " + book.getTitle() + 
                    ". Available: " + book.getQuantity() + ", Requested: " + request.getQuantity());
        }

        // Check if item already exists in cart
        Optional<CartItem> existingItem = cartItemRepository.findByCartIdAndBookId(cart.getId(), book.getId());

        if (existingItem.isPresent()) {
            // Update quantity
            CartItem item = existingItem.get();
            int newQuantity = item.getQuantity() + request.getQuantity();
            
            if (book.getQuantity() < newQuantity) {
                throw new InsufficientStockException(
                        "Insufficient stock for book: " + book.getTitle() + 
                        ". Available: " + book.getQuantity() + ", Total requested: " + newQuantity);
            }
            
            item.setQuantity(newQuantity);
            cartItemRepository.save(item);
        } else {
            // Add new item
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .book(book)
                    .quantity(request.getQuantity())
                    .build();
            cart.addItem(newItem);
            cartRepository.save(cart);
        }

        // Reload cart with items
        cart = cartRepository.findByUserIdWithItemsAndBooks(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found"));
        
        return CartResponse.fromEntity(cart);
    }

    @Transactional
    public CartResponse updateItemQuantity(Long userId, Long bookId, Integer quantity) {
        ShoppingCart cart = cartRepository.findByUserIdWithItemsAndBooks(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found for user"));

        CartItem item = cartItemRepository.findByCartIdAndBookId(cart.getId(), bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found in cart"));

        if (quantity <= 0) {
            // Remove item if quantity is 0 or negative
            cart.removeItem(item);
            cartItemRepository.delete(item);
        } else {
            // Check stock availability
            if (item.getBook().getQuantity() < quantity) {
                throw new InsufficientStockException(
                        "Insufficient stock for book: " + item.getBook().getTitle() + 
                        ". Available: " + item.getBook().getQuantity());
            }
            item.setQuantity(quantity);
            cartItemRepository.save(item);
        }

        // Reload cart
        cart = cartRepository.findByUserIdWithItemsAndBooks(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found"));
        
        return CartResponse.fromEntity(cart);
    }

    @Transactional
    public CartResponse removeItem(Long userId, Long bookId) {
        ShoppingCart cart = cartRepository.findByUserIdWithItemsAndBooks(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found for user"));

        CartItem item = cartItemRepository.findByCartIdAndBookId(cart.getId(), bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found in cart"));

        cart.removeItem(item);
        cartItemRepository.delete(item);

        // Reload cart
        cart = cartRepository.findByUserIdWithItemsAndBooks(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found"));
        
        return CartResponse.fromEntity(cart);
    }

    @Transactional
    public void clearCart(Long userId) {
        ShoppingCart cart = cartRepository.findByUserIdWithItems(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart not found for user"));

        cart.clearItems();
        cartItemRepository.deleteAllByCartId(cart.getId());
    }

    private ShoppingCart getOrCreateCart(Long userId) {
        return cartRepository.findByUserIdWithItemsAndBooks(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
                    
                    ShoppingCart newCart = ShoppingCart.builder()
                            .user(user)
                            .build();
                    return cartRepository.save(newCart);
                });
    }
}
