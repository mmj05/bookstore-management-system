package com.bookstore.dto.response;

import com.bookstore.entity.Role;
import com.bookstore.entity.User;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String phone;
    private String shippingAddress;
    private String billingAddress;
    private Role role;
    
    @JsonProperty("isActive")
    private boolean isActive;
    
    @JsonProperty("isLocked")
    private boolean isLocked;
    
    private LocalDateTime lockoutEndTime;
    private LocalDateTime lastLoginAt;
    private LocalDateTime createdAt;

    public static UserResponse fromEntity(User user) {
        // Determine if user is currently locked
        boolean locked = user.getLockoutEndTime() != null && 
                         LocalDateTime.now().isBefore(user.getLockoutEndTime());
        
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .phone(user.getPhone())
                .shippingAddress(user.getShippingAddress())
                .billingAddress(user.getBillingAddress())
                .role(user.getRole())
                .isActive(user.isActive())
                .isLocked(locked)
                .lockoutEndTime(user.getLockoutEndTime())
                .lastLoginAt(user.getLastLoginAt())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
