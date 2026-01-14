package com.bookstore.config;

import com.bookstore.entity.*;
import com.bookstore.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Set;

@Component
@Profile("!prod")
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final BookRepository bookRepository;
    private final ShoppingCartRepository shoppingCartRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Database already initialized, skipping data initialization");
            return;
        }

        log.info("Initializing sample data...");

        // Create admin user
        User admin = User.builder()
                .email("admin@bookstore.com")
                .passwordHash(passwordEncoder.encode("Admin@123"))
                .firstName("Admin")
                .lastName("User")
                .role(Role.ADMINISTRATOR)
                .isActive(true)
                .build();
        userRepository.save(admin);

        // Create manager user
        User manager = User.builder()
                .email("manager@bookstore.com")
                .passwordHash(passwordEncoder.encode("Manager@123"))
                .firstName("Store")
                .lastName("Manager")
                .role(Role.MANAGER)
                .isActive(true)
                .build();
        userRepository.save(manager);

        // Create customer user
        User customer = User.builder()
                .email("customer@example.com")
                .passwordHash(passwordEncoder.encode("Customer@123"))
                .firstName("John")
                .lastName("Doe")
                .phone("555-0123")
                .shippingAddress("123 Main St, Anytown, USA 12345")
                .billingAddress("123 Main St, Anytown, USA 12345")
                .role(Role.CUSTOMER)
                .isActive(true)
                .build();
        customer = userRepository.save(customer);

        // Create shopping cart for customer
        ShoppingCart cart = ShoppingCart.builder()
                .user(customer)
                .build();
        shoppingCartRepository.save(cart);

        // Create categories
        Category fiction = Category.builder()
                .name("Fiction")
                .description("Fictional works including novels, short stories, and more")
                .build();
        fiction = categoryRepository.save(fiction);

        Category nonFiction = Category.builder()
                .name("Non-Fiction")
                .description("Non-fictional works including biographies, history, and self-help")
                .build();
        nonFiction = categoryRepository.save(nonFiction);

        Category sciFi = Category.builder()
                .name("Science Fiction")
                .description("Science fiction and futuristic stories")
                .build();
        sciFi = categoryRepository.save(sciFi);

        Category mystery = Category.builder()
                .name("Mystery")
                .description("Mystery and thriller novels")
                .build();
        mystery = categoryRepository.save(mystery);

        Category rare = Category.builder()
                .name("Rare Books")
                .description("Rare and collectible books")
                .build();
        rare = categoryRepository.save(rare);

        Category classics = Category.builder()
                .name("Classics")
                .description("Classic literature and timeless works")
                .build();
        classics = categoryRepository.save(classics);

        // Create sample books
        Book book1 = Book.builder()
                .isbn("978-0-13-468599-1")
                .title("The Great Gatsby")
                .author("F. Scott Fitzgerald")
                .description("A classic American novel about the decadence of the Jazz Age")
                .publisher("Scribner")
                .publicationYear(1925)
                .price(new BigDecimal("15.99"))
                .quantity(25)
                .bookCondition(BookCondition.NEW)
                .isRare(false)
                .categories(Set.of(fiction, classics))
                .build();
        bookRepository.save(book1);

        Book book2 = Book.builder()
                .isbn("978-0-06-112008-4")
                .title("To Kill a Mockingbird")
                .author("Harper Lee")
                .description("A powerful story of racial injustice and childhood innocence")
                .publisher("J.B. Lippincott & Co.")
                .publicationYear(1960)
                .price(new BigDecimal("14.99"))
                .quantity(30)
                .bookCondition(BookCondition.NEW)
                .isRare(false)
                .categories(Set.of(fiction, classics))
                .build();
        bookRepository.save(book2);

        Book book3 = Book.builder()
                .isbn("978-0-7432-7356-5")
                .title("1984")
                .author("George Orwell")
                .description("A dystopian novel about totalitarianism")
                .publisher("Secker & Warburg")
                .publicationYear(1949)
                .price(new BigDecimal("13.99"))
                .quantity(40)
                .bookCondition(BookCondition.NEW)
                .isRare(false)
                .categories(Set.of(fiction, sciFi, classics))
                .build();
        bookRepository.save(book3);

        Book book4 = Book.builder()
                .isbn("978-0-316-76948-0")
                .title("The Catcher in the Rye")
                .author("J.D. Salinger")
                .description("A story of teenage alienation and loss of innocence")
                .publisher("Little, Brown and Company")
                .publicationYear(1951)
                .price(new BigDecimal("12.99"))
                .quantity(20)
                .bookCondition(BookCondition.NEW)
                .isRare(false)
                .categories(Set.of(fiction, classics))
                .build();
        bookRepository.save(book4);

        Book book5 = Book.builder()
                .isbn("978-0-14-028329-7")
                .title("The Adventures of Sherlock Holmes")
                .author("Arthur Conan Doyle")
                .description("Classic detective stories featuring Sherlock Holmes")
                .publisher("George Newnes")
                .publicationYear(1892)
                .price(new BigDecimal("11.99"))
                .quantity(15)
                .bookCondition(BookCondition.NEW)
                .isRare(false)
                .categories(Set.of(fiction, mystery, classics))
                .build();
        bookRepository.save(book5);

        Book book6 = Book.builder()
                .isbn("978-0-553-21311-0")
                .title("Dune")
                .author("Frank Herbert")
                .description("An epic science fiction novel set in a distant future")
                .publisher("Chilton Books")
                .publicationYear(1965)
                .price(new BigDecimal("18.99"))
                .quantity(35)
                .bookCondition(BookCondition.NEW)
                .isRare(false)
                .categories(Set.of(fiction, sciFi))
                .build();
        bookRepository.save(book6);

        Book book7 = Book.builder()
                .isbn("978-1-9821-4644-2")
                .title("Atomic Habits")
                .author("James Clear")
                .description("An easy and proven way to build good habits")
                .publisher("Avery")
                .publicationYear(2018)
                .price(new BigDecimal("24.99"))
                .quantity(50)
                .bookCondition(BookCondition.NEW)
                .isRare(false)
                .categories(Set.of(nonFiction))
                .build();
        bookRepository.save(book7);

        // Rare book example
        Book book8 = Book.builder()
                .isbn("978-0-00-000001-0")
                .title("First Edition: Pride and Prejudice")
                .author("Jane Austen")
                .description("Rare first edition copy from 1813")
                .publisher("T. Egerton")
                .publicationYear(1813)
                .price(new BigDecimal("2500.00"))
                .quantity(1)
                .bookCondition(BookCondition.GOOD)
                .isRare(true)
                .categories(Set.of(fiction, classics, rare))
                .build();
        bookRepository.save(book8);

        // Low stock book
        Book book9 = Book.builder()
                .isbn("978-0-452-28423-4")
                .title("Animal Farm")
                .author("George Orwell")
                .description("A satirical allegorical novella")
                .publisher("Secker and Warburg")
                .publicationYear(1945)
                .price(new BigDecimal("10.99"))
                .quantity(3)
                .bookCondition(BookCondition.NEW)
                .isRare(false)
                .categories(Set.of(fiction, classics))
                .build();
        bookRepository.save(book9);

        // Out of stock book
        Book book10 = Book.builder()
                .isbn("978-0-7432-7357-2")
                .title("Brave New World")
                .author("Aldous Huxley")
                .description("A dystopian novel about a technologically advanced future")
                .publisher("Chatto & Windus")
                .publicationYear(1932)
                .price(new BigDecimal("14.99"))
                .quantity(0)
                .bookCondition(BookCondition.NEW)
                .isRare(false)
                .categories(Set.of(fiction, sciFi, classics))
                .build();
        bookRepository.save(book10);

        log.info("Sample data initialization complete!");
        log.info("Created users: admin@bookstore.com (Admin@123), manager@bookstore.com (Manager@123), customer@example.com (Customer@123)");
    }
}
