package com.bookstore.service;

import com.bookstore.repository.BookRepository;
import com.bookstore.repository.OrderItemRepository;
import com.bookstore.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final BookRepository bookRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;

    public Map<String, Object> getInventoryReport() {
        Map<String, Object> report = new HashMap<>();
        
        // Total inventory value
        BigDecimal totalValue = bookRepository.getTotalInventoryValue();
        report.put("totalInventoryValue", totalValue != null ? totalValue : BigDecimal.ZERO);
        
        // Book count by category
        List<Object[]> categoryData = bookRepository.getBookCountByCategory();
        Map<String, Long> booksByCategory = categoryData.stream()
                .collect(Collectors.toMap(
                        row -> (String) row[0],
                        row -> (Long) row[1]
                ));
        report.put("booksByCategory", booksByCategory);
        
        // Low stock books (threshold: 5)
        report.put("lowStockBooks", bookRepository.findLowStock(5).size());
        
        // Out of stock books
        report.put("outOfStockBooks", bookRepository.findOutOfStock().size());
        
        // Total books
        report.put("totalBooks", bookRepository.count());
        
        return report;
    }

    public Map<String, Object> getSalesReport(LocalDateTime startDate, LocalDateTime endDate) {
        Map<String, Object> report = new HashMap<>();
        
        // Total revenue
        BigDecimal totalRevenue = orderRepository.getTotalRevenue();
        report.put("totalRevenue", totalRevenue != null ? totalRevenue : BigDecimal.ZERO);
        
        // Revenue in date range
        if (startDate != null && endDate != null) {
            BigDecimal periodRevenue = orderRepository.getRevenueByDateRange(startDate, endDate);
            report.put("periodRevenue", periodRevenue != null ? periodRevenue : BigDecimal.ZERO);
        }
        
        // Order counts by status
        Map<String, Long> ordersByStatus = new HashMap<>();
        for (com.bookstore.entity.OrderStatus status : com.bookstore.entity.OrderStatus.values()) {
            Long count = orderRepository.countByStatus(status);
            ordersByStatus.put(status.name(), count);
        }
        report.put("ordersByStatus", ordersByStatus);
        
        // Total orders
        report.put("totalOrders", orderRepository.count());
        
        // Best selling books
        List<Object[]> bestSellers = orderItemRepository.findBestSellingBooks();
        List<Map<String, Object>> bestSellingBooks = bestSellers.stream()
                .limit(10)
                .map(row -> {
                    Map<String, Object> book = new HashMap<>();
                    book.put("bookId", row[0]);
                    book.put("title", row[1]);
                    book.put("totalSold", row[2]);
                    return book;
                })
                .collect(Collectors.toList());
        report.put("bestSellingBooks", bestSellingBooks);
        
        return report;
    }

    public List<Map<String, Object>> getDailySalesReport() {
        List<Object[]> data = orderRepository.getDailySalesReport();
        return data.stream()
                .map(row -> {
                    Map<String, Object> day = new HashMap<>();
                    day.put("date", row[0]);
                    day.put("orderCount", row[1]);
                    day.put("revenue", row[2]);
                    return day;
                })
                .collect(Collectors.toList());
    }
}
