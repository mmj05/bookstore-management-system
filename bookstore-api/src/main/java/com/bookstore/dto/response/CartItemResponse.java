package com.bookstore.dto.response;

import com.bookstore.entity.CartItem;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartItemResponse {
    private Long id;
    private Long bookId;
    private String bookTitle;
    private String bookAuthor;
    private String bookIsbn;
    private String imageUrl;
    private BigDecimal price;
    private Integer quantity;
    private BigDecimal lineTotal;
    private Integer availableStock;
    private LocalDateTime addedAt;

    public static CartItemResponse fromEntity(CartItem item) {
        return CartItemResponse.builder()
                .id(item.getId())
                .bookId(item.getBook().getId())
                .bookTitle(item.getBook().getTitle())
                .bookAuthor(item.getBook().getAuthor())
                .bookIsbn(item.getBook().getIsbn())
                .imageUrl(item.getBook().getImageUrl())
                .price(item.getBook().getPrice())
                .quantity(item.getQuantity())
                .lineTotal(item.getBook().getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .availableStock(item.getBook().getQuantity())
                .addedAt(item.getAddedAt())
                .build();
    }
}
