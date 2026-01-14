package com.bookstore.service;

import com.bookstore.dto.request.CreateUserRequest;
import com.bookstore.dto.response.UserResponse;
import com.bookstore.entity.Role;
import com.bookstore.entity.ShoppingCart;
import com.bookstore.entity.User;
import com.bookstore.exception.BookstoreExceptions.*;
import com.bookstore.repository.ShoppingCartRepository;
import com.bookstore.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final ShoppingCartRepository shoppingCartRepository;
    private final PasswordEncoder passwordEncoder;

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(UserResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return UserResponse.fromEntity(user);
    }

    public UserResponse getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        return UserResponse.fromEntity(user);
    }

    public List<UserResponse> getUsersByRole(Role role) {
        return userRepository.findByRole(role).stream()
                .map(UserResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public List<UserResponse> searchUsers(String query) {
        return userRepository.searchUsers(query).stream()
                .map(UserResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserResponse createUser(CreateUserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already registered: " + request.getEmail());
        }

        User user = User.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .phone(request.getPhone())
                .role(request.getRole())
                .isActive(true)
                .failedLoginAttempts(0)
                .build();

        user = userRepository.save(user);

        // Create shopping cart for customer users
        if (request.getRole() == Role.CUSTOMER) {
            ShoppingCart cart = ShoppingCart.builder()
                    .user(user)
                    .build();
            shoppingCartRepository.save(cart);
        }

        return UserResponse.fromEntity(user);
    }

    @Transactional
    public UserResponse updateUserRole(Long id, Role role) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        user.setRole(role);
        user = userRepository.save(user);

        // Create cart if user becomes a customer and doesn't have one
        if (role == Role.CUSTOMER && !shoppingCartRepository.existsByUserId(id)) {
            ShoppingCart cart = ShoppingCart.builder()
                    .user(user)
                    .build();
            shoppingCartRepository.save(cart);
        }

        return UserResponse.fromEntity(user);
    }

    @Transactional
    public UserResponse activateUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        user.setActive(true);
        user.setFailedLoginAttempts(0);
        user.setLockoutEndTime(null);
        user = userRepository.save(user);

        return UserResponse.fromEntity(user);
    }

    @Transactional
    public UserResponse deactivateUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        user.setActive(false);
        user = userRepository.save(user);

        return UserResponse.fromEntity(user);
    }

    @Transactional
    public void unlockUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        user.setFailedLoginAttempts(0);
        user.setLockoutEndTime(null);
        userRepository.save(user);
    }

    @Transactional
    public UserResponse updateProfile(Long userId, String firstName, String lastName, String phone, 
                                       String shippingAddress, String billingAddress) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (firstName != null) user.setFirstName(firstName);
        if (lastName != null) user.setLastName(lastName);
        if (phone != null) user.setPhone(phone);
        if (shippingAddress != null) user.setShippingAddress(shippingAddress);
        if (billingAddress != null) user.setBillingAddress(billingAddress);

        user = userRepository.save(user);
        return UserResponse.fromEntity(user);
    }

    @Transactional
    public void changePassword(Long userId, String currentPassword, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (!passwordEncoder.matches(currentPassword, user.getPasswordHash())) {
            throw new BadRequestException("Current password is incorrect");
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}
