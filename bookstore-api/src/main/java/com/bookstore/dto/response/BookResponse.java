package com.bookstore.dto.response;

import com.bookstore.entity.Book;
import com.bookstore.entity.BookCondition;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookResponse {
    private Long id;
    private String isbn;
    private String title;
    private String author;
    private String description;
    private String publisher;
    private Integer publicationYear;
    private BigDecimal price;
    private Integer quantity;
    private BookCondition bookCondition;
    private String imageUrl;
    private Boolean isRare;
    private Set<CategoryResponse> categories;
    private boolean inStock;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static BookResponse fromEntity(Book book) {
        return BookResponse.builder()
                .id(book.getId())
                .isbn(book.getIsbn())
                .title(book.getTitle())
                .author(book.getAuthor())
                .description(book.getDescription())
                .publisher(book.getPublisher())
                .publicationYear(book.getPublicationYear())
                .price(book.getPrice())
                .quantity(book.getQuantity())
                .bookCondition(book.getBookCondition())
                .imageUrl(book.getImageUrl())
                .isRare(book.getIsRare())
                .categories(book.getCategories().stream()
                        .map(CategoryResponse::fromEntity)
                        .collect(Collectors.toSet()))
                .inStock(book.getQuantity() > 0)
                .createdAt(book.getCreatedAt())
                .updatedAt(book.getUpdatedAt())
                .build();
    }
}
