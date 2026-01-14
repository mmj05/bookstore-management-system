package com.bookstore.service;

import com.bookstore.dto.request.BookRequest;
import com.bookstore.dto.response.BookResponse;
import com.bookstore.dto.response.PageResponse;
import com.bookstore.entity.Book;
import com.bookstore.entity.BookCondition;
import com.bookstore.entity.Category;
import com.bookstore.exception.BookstoreExceptions.*;
import com.bookstore.repository.BookRepository;
import com.bookstore.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookService {

    private final BookRepository bookRepository;
    private final CategoryRepository categoryRepository;

    public PageResponse<BookResponse> getAllBooks(int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc") 
                ? Sort.by(sortBy).descending() 
                : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<BookResponse> bookPage = bookRepository.findAll(pageable)
                .map(BookResponse::fromEntity);
        
        return PageResponse.fromPage(bookPage);
    }

    public BookResponse getBookById(Long id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + id));
        return BookResponse.fromEntity(book);
    }

    public BookResponse getBookByIsbn(String isbn) {
        Book book = bookRepository.findByIsbn(isbn)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with ISBN: " + isbn));
        return BookResponse.fromEntity(book);
    }

    public PageResponse<BookResponse> searchBooks(String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<BookResponse> bookPage = bookRepository.searchBooks(keyword, pageable)
                .map(BookResponse::fromEntity);
        return PageResponse.fromPage(bookPage);
    }

    public PageResponse<BookResponse> getBooksByCategory(Long categoryId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<BookResponse> bookPage = bookRepository.findByCategory(categoryId, pageable)
                .map(BookResponse::fromEntity);
        return PageResponse.fromPage(bookPage);
    }

    public PageResponse<BookResponse> advancedSearch(
            String keyword,
            Long categoryId,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            BookCondition condition,
            Boolean isRare,
            Boolean inStock,
            int page,
            int size,
            String sortBy,
            String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase("desc") 
                ? Sort.by(sortBy).descending() 
                : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<BookResponse> bookPage = bookRepository.advancedSearch(
                keyword, categoryId, minPrice, maxPrice, condition, isRare, inStock, pageable)
                .map(BookResponse::fromEntity);
        
        return PageResponse.fromPage(bookPage);
    }

    public PageResponse<BookResponse> getInStockBooks(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<BookResponse> bookPage = bookRepository.findInStock(pageable)
                .map(BookResponse::fromEntity);
        return PageResponse.fromPage(bookPage);
    }

    public List<BookResponse> getLowStockBooks(int threshold) {
        return bookRepository.findLowStock(threshold).stream()
                .map(BookResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public List<BookResponse> getOutOfStockBooks() {
        return bookRepository.findOutOfStock().stream()
                .map(BookResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public BookResponse createBook(BookRequest request) {
        if (bookRepository.existsByIsbn(request.getIsbn())) {
            throw new DuplicateResourceException("Book already exists with ISBN: " + request.getIsbn());
        }

        Set<Category> categories = new HashSet<>();
        if (request.getCategoryIds() != null && !request.getCategoryIds().isEmpty()) {
            categories = request.getCategoryIds().stream()
                    .map(id -> categoryRepository.findById(id)
                            .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id)))
                    .collect(Collectors.toSet());
        }

        Book book = Book.builder()
                .isbn(request.getIsbn())
                .title(request.getTitle())
                .author(request.getAuthor())
                .description(request.getDescription())
                .publisher(request.getPublisher())
                .publicationYear(request.getPublicationYear())
                .price(request.getPrice())
                .quantity(request.getQuantity())
                .bookCondition(request.getBookCondition() != null ? request.getBookCondition() : BookCondition.NEW)
                .imageUrl(request.getImageUrl())
                .isRare(request.getIsRare() != null ? request.getIsRare() : false)
                .categories(categories)
                .build();

        book = bookRepository.save(book);
        return BookResponse.fromEntity(book);
    }

    @Transactional
    public BookResponse updateBook(Long id, BookRequest request) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + id));

        // Check if new ISBN conflicts with existing book
        if (!book.getIsbn().equals(request.getIsbn()) && 
            bookRepository.existsByIsbn(request.getIsbn())) {
            throw new DuplicateResourceException("Book already exists with ISBN: " + request.getIsbn());
        }

        book.setIsbn(request.getIsbn());
        book.setTitle(request.getTitle());
        book.setAuthor(request.getAuthor());
        book.setDescription(request.getDescription());
        book.setPublisher(request.getPublisher());
        book.setPublicationYear(request.getPublicationYear());
        book.setPrice(request.getPrice());
        book.setQuantity(request.getQuantity());
        
        if (request.getBookCondition() != null) {
            book.setBookCondition(request.getBookCondition());
        }
        if (request.getImageUrl() != null) {
            book.setImageUrl(request.getImageUrl());
        }
        if (request.getIsRare() != null) {
            book.setIsRare(request.getIsRare());
        }

        // Update categories
        if (request.getCategoryIds() != null) {
            book.getCategories().clear();
            Set<Category> categories = request.getCategoryIds().stream()
                    .map(catId -> categoryRepository.findById(catId)
                            .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + catId)))
                    .collect(Collectors.toSet());
            book.getCategories().addAll(categories);
        }

        book = bookRepository.save(book);
        return BookResponse.fromEntity(book);
    }

    @Transactional
    public BookResponse updateBookQuantity(Long id, Integer quantity) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + id));
        
        if (quantity < 0) {
            throw new BadRequestException("Quantity cannot be negative");
        }
        
        book.setQuantity(quantity);
        book = bookRepository.save(book);
        return BookResponse.fromEntity(book);
    }

    @Transactional
    public void deleteBook(Long id) {
        if (!bookRepository.existsById(id)) {
            throw new ResourceNotFoundException("Book not found with id: " + id);
        }
        bookRepository.deleteById(id);
    }

    @Transactional
    public BookResponse addCategoryToBook(Long bookId, Long categoryId) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + bookId));
        
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + categoryId));
        
        book.addCategory(category);
        book = bookRepository.save(book);
        return BookResponse.fromEntity(book);
    }

    @Transactional
    public BookResponse removeCategoryFromBook(Long bookId, Long categoryId) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found with id: " + bookId));
        
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + categoryId));
        
        book.removeCategory(category);
        book = bookRepository.save(book);
        return BookResponse.fromEntity(book);
    }
}
