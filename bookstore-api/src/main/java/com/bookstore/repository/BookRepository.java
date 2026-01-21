package com.bookstore.repository;

import com.bookstore.entity.Book;
import com.bookstore.entity.BookCondition;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {

    Optional<Book> findByIsbn(String isbn);

    boolean existsByIsbn(String isbn);

    List<Book> findByAuthor(String author);

    List<Book> findByIsRare(Boolean isRare);

    List<Book> findByBookCondition(BookCondition condition);

    // Search by title, author, or ISBN
    @Query("SELECT b FROM Book b WHERE " +
            "LOWER(b.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(b.author) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(b.isbn) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Book> searchBooks(@Param("keyword") String keyword, Pageable pageable);

    // Find books by category
    @Query("SELECT b FROM Book b JOIN b.categories c WHERE c.id = :categoryId")
    Page<Book> findByCategory(@Param("categoryId") Long categoryId, Pageable pageable);

    // Find books by category name
    @Query("SELECT b FROM Book b JOIN b.categories c WHERE c.name = :categoryName")
    List<Book> findByCategoryName(@Param("categoryName") String categoryName);

    // Find books with quantity > 0 (in stock)
    @Query("SELECT b FROM Book b WHERE b.quantity > 0")
    Page<Book> findInStock(Pageable pageable);

    // Find low stock books (quantity < threshold)
    @Query("SELECT b FROM Book b WHERE b.quantity < :threshold AND b.quantity > 0")
    List<Book> findLowStock(@Param("threshold") int threshold);

    // Find out of stock books
    @Query("SELECT b FROM Book b WHERE b.quantity = 0")
    List<Book> findOutOfStock();

    // Filter by price range
    @Query("SELECT b FROM Book b WHERE b.price BETWEEN :minPrice AND :maxPrice")
    Page<Book> findByPriceRange(@Param("minPrice") BigDecimal minPrice,
                                @Param("maxPrice") BigDecimal maxPrice,
                                Pageable pageable);

    // Advanced search with multiple filters - Fixed for PostgreSQL null handling
    // Now includes ISBN in keyword search
    @Query(value = "SELECT DISTINCT b.* FROM books b " +
            "LEFT JOIN book_categories bc ON b.id = bc.book_id " +
            "LEFT JOIN categories c ON bc.category_id = c.id " +
            "WHERE (:keyword IS NULL OR :keyword = '' OR LOWER(b.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(b.author) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(b.isbn) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
            "AND (:categoryId IS NULL OR c.id = :categoryId) " +
            "AND (:minPrice IS NULL OR b.price >= :minPrice) " +
            "AND (:maxPrice IS NULL OR b.price <= :maxPrice) " +
            "AND (:condition IS NULL OR b.book_condition = :condition) " +
            "AND (:isRare IS NULL OR b.is_rare = :isRare) " +
            "AND (:inStock IS NULL OR (:inStock = true AND b.quantity > 0) OR :inStock = false) " +
            "ORDER BY b.created_at DESC",
            countQuery = "SELECT COUNT(DISTINCT b.id) FROM books b " +
                    "LEFT JOIN book_categories bc ON b.id = bc.book_id " +
                    "LEFT JOIN categories c ON bc.category_id = c.id " +
                    "WHERE (:keyword IS NULL OR :keyword = '' OR LOWER(b.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(b.author) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(b.isbn) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
                    "AND (:categoryId IS NULL OR c.id = :categoryId) " +
                    "AND (:minPrice IS NULL OR b.price >= :minPrice) " +
                    "AND (:maxPrice IS NULL OR b.price <= :maxPrice) " +
                    "AND (:condition IS NULL OR b.book_condition = :condition) " +
                    "AND (:isRare IS NULL OR b.is_rare = :isRare) " +
                    "AND (:inStock IS NULL OR (:inStock = true AND b.quantity > 0) OR :inStock = false)",
            nativeQuery = true)
    Page<Book> advancedSearch(
            @Param("keyword") String keyword,
            @Param("categoryId") Long categoryId,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("condition") String condition,
            @Param("isRare") Boolean isRare,
            @Param("inStock") Boolean inStock,
            Pageable pageable
    );

    // Inventory reports
    @Query("SELECT SUM(b.price * b.quantity) FROM Book b")
    BigDecimal getTotalInventoryValue();

    @Query("SELECT c.name, COUNT(b) FROM Book b JOIN b.categories c GROUP BY c.name")
    List<Object[]> getBookCountByCategory();
}