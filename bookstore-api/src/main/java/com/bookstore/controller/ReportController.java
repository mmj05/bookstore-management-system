package com.bookstore.controller;

import com.bookstore.dto.response.ApiResponse;
import com.bookstore.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('MANAGER', 'ADMINISTRATOR')")
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/inventory")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getInventoryReport() {
        Map<String, Object> report = reportService.getInventoryReport();
        return ResponseEntity.ok(ApiResponse.success(report));
    }

    @GetMapping("/sales")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSalesReport(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        Map<String, Object> report = reportService.getSalesReport(startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(report));
    }

    @GetMapping("/sales/daily")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getDailySalesReport() {
        List<Map<String, Object>> report = reportService.getDailySalesReport();
        return ResponseEntity.ok(ApiResponse.success(report));
    }
}
