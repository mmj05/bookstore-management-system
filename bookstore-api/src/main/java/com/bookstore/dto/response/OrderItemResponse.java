package com.bookstore.dto.response;

import com.bookstore.entity.OrderItem;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemResponse {
    private Long id;
    private Long bookId;
    private String bookTitle;
    private String bookAuthor;
    private String bookIsbn;
    private Integer quantity;
    private BigDecimal priceAtPurchase;
    private BigDecimal lineTotal;

    public static OrderItemResponse fromEntity(OrderItem item) {
        return OrderItemResponse.builder()
                .id(item.getId())
                .bookId(item.getBook().getId())
                .bookTitle(item.getBook().getTitle())
                .bookAuthor(item.getBook().getAuthor())
                .bookIsbn(item.getBook().getIsbn())
                .quantity(item.getQuantity())
                .priceAtPurchase(item.getPriceAtPurchase())
                .lineTotal(item.getLineTotal())
                .build();
    }
}
