package com.bookstore.dto.response;

import com.bookstore.entity.ShoppingCart;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartResponse {
    private Long id;
    private Long userId;
    private List<CartItemResponse> items;
    private int totalItems;
    private BigDecimal subtotal;
    private BigDecimal estimatedTax;
    private BigDecimal estimatedShipping;
    private BigDecimal estimatedTotal;
    private LocalDateTime updatedAt;

    public static CartResponse fromEntity(ShoppingCart cart) {
        BigDecimal subtotal = cart.getTotal();
        BigDecimal tax = subtotal.multiply(BigDecimal.valueOf(0.08)).setScale(2, java.math.RoundingMode.HALF_UP);
        BigDecimal shipping = subtotal.compareTo(BigDecimal.valueOf(50)) >= 0 
            ? BigDecimal.ZERO 
            : BigDecimal.valueOf(5.99);
        
        return CartResponse.builder()
                .id(cart.getId())
                .userId(cart.getUser().getId())
                .items(cart.getItems().stream()
                        .map(CartItemResponse::fromEntity)
                        .collect(Collectors.toList()))
                .totalItems(cart.getTotalItems())
                .subtotal(subtotal)
                .estimatedTax(tax)
                .estimatedShipping(shipping)
                .estimatedTotal(subtotal.add(tax).add(shipping))
                .updatedAt(cart.getUpdatedAt())
                .build();
    }
}
