package com.bookstore.controller;

import com.bookstore.dto.request.BookRequest;
import com.bookstore.dto.response.ApiResponse;
import com.bookstore.dto.response.BookResponse;
import com.bookstore.dto.response.PageResponse;
import com.bookstore.entity.BookCondition;
import com.bookstore.service.BookService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/books")
@RequiredArgsConstructor
public class BookController {

    private final BookService bookService;

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<BookResponse>>> getAllBooks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        PageResponse<BookResponse> books = bookService.getAllBooks(page, size, sortBy, sortDir);
        return ResponseEntity.ok(ApiResponse.success(books));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BookResponse>> getBookById(@PathVariable Long id) {
        BookResponse book = bookService.getBookById(id);
        return ResponseEntity.ok(ApiResponse.success(book));
    }

    @GetMapping("/isbn/{isbn}")
    public ResponseEntity<ApiResponse<BookResponse>> getBookByIsbn(@PathVariable String isbn) {
        BookResponse book = bookService.getBookByIsbn(isbn);
        return ResponseEntity.ok(ApiResponse.success(book));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<PageResponse<BookResponse>>> searchBooks(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageResponse<BookResponse> books = bookService.searchBooks(keyword, page, size);
        return ResponseEntity.ok(ApiResponse.success(books));
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<ApiResponse<PageResponse<BookResponse>>> getBooksByCategory(
            @PathVariable Long categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageResponse<BookResponse> books = bookService.getBooksByCategory(categoryId, page, size);
        return ResponseEntity.ok(ApiResponse.success(books));
    }

    @GetMapping("/filter")
    public ResponseEntity<ApiResponse<PageResponse<BookResponse>>> advancedSearch(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) BookCondition condition,
            @RequestParam(required = false) Boolean isRare,
            @RequestParam(required = false) Boolean inStock,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        PageResponse<BookResponse> books = bookService.advancedSearch(
                keyword, categoryId, minPrice, maxPrice, condition, isRare, inStock,
                page, size, sortBy, sortDir);
        return ResponseEntity.ok(ApiResponse.success(books));
    }

    @GetMapping("/in-stock")
    public ResponseEntity<ApiResponse<PageResponse<BookResponse>>> getInStockBooks(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PageResponse<BookResponse> books = bookService.getInStockBooks(page, size);
        return ResponseEntity.ok(ApiResponse.success(books));
    }

    @GetMapping("/low-stock")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMINISTRATOR')")
    public ResponseEntity<ApiResponse<List<BookResponse>>> getLowStockBooks(
            @RequestParam(defaultValue = "5") int threshold) {
        List<BookResponse> books = bookService.getLowStockBooks(threshold);
        return ResponseEntity.ok(ApiResponse.success(books));
    }

    @GetMapping("/out-of-stock")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMINISTRATOR')")
    public ResponseEntity<ApiResponse<List<BookResponse>>> getOutOfStockBooks() {
        List<BookResponse> books = bookService.getOutOfStockBooks();
        return ResponseEntity.ok(ApiResponse.success(books));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMINISTRATOR')")
    public ResponseEntity<ApiResponse<BookResponse>> createBook(@Valid @RequestBody BookRequest request) {
        BookResponse book = bookService.createBook(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Book created successfully", book));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMINISTRATOR')")
    public ResponseEntity<ApiResponse<BookResponse>> updateBook(
            @PathVariable Long id,
            @Valid @RequestBody BookRequest request) {
        BookResponse book = bookService.updateBook(id, request);
        return ResponseEntity.ok(ApiResponse.success("Book updated successfully", book));
    }

    @PatchMapping("/{id}/quantity")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMINISTRATOR')")
    public ResponseEntity<ApiResponse<BookResponse>> updateBookQuantity(
            @PathVariable Long id,
            @RequestParam Integer quantity) {
        BookResponse book = bookService.updateBookQuantity(id, quantity);
        return ResponseEntity.ok(ApiResponse.success("Quantity updated successfully", book));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMINISTRATOR')")
    public ResponseEntity<ApiResponse<Void>> deleteBook(@PathVariable Long id) {
        bookService.deleteBook(id);
        return ResponseEntity.ok(ApiResponse.success("Book deleted successfully"));
    }

    @PostMapping("/{bookId}/categories/{categoryId}")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMINISTRATOR')")
    public ResponseEntity<ApiResponse<BookResponse>> addCategoryToBook(
            @PathVariable Long bookId,
            @PathVariable Long categoryId) {
        BookResponse book = bookService.addCategoryToBook(bookId, categoryId);
        return ResponseEntity.ok(ApiResponse.success("Category added to book", book));
    }

    @DeleteMapping("/{bookId}/categories/{categoryId}")
    @PreAuthorize("hasAnyRole('MANAGER', 'ADMINISTRATOR')")
    public ResponseEntity<ApiResponse<BookResponse>> removeCategoryFromBook(
            @PathVariable Long bookId,
            @PathVariable Long categoryId) {
        BookResponse book = bookService.removeCategoryFromBook(bookId, categoryId);
        return ResponseEntity.ok(ApiResponse.success("Category removed from book", book));
    }
}
