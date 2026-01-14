package com.bookstore.repository;

import com.bookstore.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    
    List<OrderItem> findByOrderId(Long orderId);
    
    // Find most sold books
    @Query("SELECT oi.book.id, oi.book.title, SUM(oi.quantity) as totalSold " +
           "FROM OrderItem oi WHERE oi.order.status != 'CANCELLED' " +
           "GROUP BY oi.book.id, oi.book.title ORDER BY totalSold DESC")
    List<Object[]> findBestSellingBooks();
    
    // Sales by book
    @Query("SELECT SUM(oi.quantity) FROM OrderItem oi WHERE oi.book.id = :bookId AND oi.order.status != 'CANCELLED'")
    Long getTotalSoldByBook(@Param("bookId") Long bookId);
}
