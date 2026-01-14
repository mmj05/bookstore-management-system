# Bookstore Management System - Backend API

## Group 1 Project

A Spring Boot REST API for the Bookstore Management System with PostgreSQL database.

## Technology Stack

- **Java 17**
- **Spring Boot 3.2.1**
- **Spring Security with JWT**
- **Spring Data JPA**
- **PostgreSQL**
- **Maven**

## Features Implemented

### Sprint 1 Features
- ✅ **US-01**: Inventory Tracking System (CRUD for books)
- ✅ **US-02**: Book Categorization (categories management)
- ✅ **US-04**: Customer Registration and Login (JWT authentication)
- ✅ **US-05**: Online Book Browsing (search, filter, pagination)
- ✅ **US-06**: Shopping Cart and Checkout (Cash on Delivery)
- ✅ **US-09**: User Authentication Security (bcrypt, account lockout)

### Sprint 2 Features
- ✅ **US-03**: Inventory Reports
- ✅ **US-07**: Order Tracking
- ✅ **US-08**: Admin User Management
- ✅ **US-10**: Data Protection (role-based access)

## Project Structure

```
bookstore-api/
├── src/main/java/com/bookstore/
│   ├── config/           # Security & data initialization
│   ├── controller/       # REST API endpoints
│   ├── dto/              # Request/Response DTOs
│   │   ├── request/
│   │   └── response/
│   ├── entity/           # JPA entities
│   ├── exception/        # Custom exceptions & handlers
│   ├── repository/       # Data access layer
│   ├── security/         # JWT authentication
│   └── service/          # Business logic
├── src/main/resources/
│   └── application.properties
└── pom.xml
```

## Prerequisites

1. **Java 17+** installed
2. **PostgreSQL 15+** installed and running
3. **Maven** installed

## Database Setup

```sql
-- Connect to PostgreSQL and run:
CREATE DATABASE bookstore_db;
CREATE USER bookstore_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE bookstore_db TO bookstore_user;
```

## Configuration

Edit `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/bookstore_db
spring.datasource.username=bookstore_user
spring.datasource.password=your_password
```

## Running the Application

```bash
# Navigate to project directory
cd bookstore-api

# Build the project
mvn clean install

# Run the application
mvn spring-boot:run
```

The API will be available at `http://localhost:8080`

## Sample Users (Dev Mode)

On first run, the following users are created:

| Email | Password | Role |
|-------|----------|------|
| admin@bookstore.com | Admin@123 | ADMINISTRATOR |
| manager@bookstore.com | Manager@123 | MANAGER |
| customer@example.com | Customer@123 | CUSTOMER |

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new customer |
| POST | /api/auth/login | Login |
| POST | /api/auth/refresh | Refresh token |

### Books (Public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/books | List all books (paginated) |
| GET | /api/books/{id} | Get book by ID |
| GET | /api/books/isbn/{isbn} | Get book by ISBN |
| GET | /api/books/search?keyword= | Search books |
| GET | /api/books/category/{id} | Books by category |
| GET | /api/books/filter | Advanced search |

### Books (Manager/Admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/books | Create book |
| PUT | /api/books/{id} | Update book |
| PATCH | /api/books/{id}/quantity | Update quantity |
| DELETE | /api/books/{id} | Delete book |
| GET | /api/books/low-stock | Low stock books |
| GET | /api/books/out-of-stock | Out of stock books |

### Categories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/categories | List all categories |
| GET | /api/categories/{id} | Get category |
| POST | /api/categories | Create category (Manager) |
| PUT | /api/categories/{id} | Update category (Manager) |
| DELETE | /api/categories/{id} | Delete category (Manager) |

### Shopping Cart (Authenticated)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/cart | Get cart |
| POST | /api/cart/items | Add item |
| PUT | /api/cart/items/{bookId} | Update quantity |
| DELETE | /api/cart/items/{bookId} | Remove item |
| DELETE | /api/cart/clear | Clear cart |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/orders/checkout | Place order (COD) |
| GET | /api/orders | My orders |
| GET | /api/orders/{id} | Order details |
| POST | /api/orders/{id}/cancel | Cancel order |
| GET | /api/orders/all | All orders (Manager) |
| PUT | /api/orders/{id}/status | Update status (Manager) |

### Users (Admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/users | List all users |
| GET | /api/users/{id} | Get user |
| POST | /api/users | Create user |
| PUT | /api/users/{id}/role | Update role |
| POST | /api/users/{id}/activate | Activate user |
| POST | /api/users/{id}/deactivate | Deactivate user |
| POST | /api/users/{id}/unlock | Unlock account |

### Reports (Manager/Admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/reports/inventory | Inventory report |
| GET | /api/reports/sales | Sales report |
| GET | /api/reports/sales/daily | Daily sales |

## Security Features

- **JWT Authentication**: 15-minute access tokens, 7-day refresh tokens
- **Password Security**: BCrypt with 12 salt rounds
- **Account Lockout**: 5 failed attempts = 15-minute lockout
- **Role-Based Access Control**: Customer, Manager, Administrator
- **CORS Configuration**: Configured for frontend at localhost:5173

## Payment Method

This implementation uses **Cash on Delivery (COD)** as the payment method:
- No payment processing required at checkout
- Order status flow: PENDING → PROCESSING → SHIPPED → DELIVERED
- Payment collected upon delivery

## Testing the API

### Using cURL

```bash
# Register a new customer
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@123",
    "firstName": "Test",
    "lastName": "User"
  }'

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@example.com",
    "password": "Customer@123"
  }'

# Get books (public)
curl http://localhost:8080/api/books

# Get cart (authenticated)
curl http://localhost:8080/api/cart \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Add to cart
curl -X POST http://localhost:8080/api/cart/items \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"bookId": 1, "quantity": 2}'

# Checkout
curl -X POST http://localhost:8080/api/orders/checkout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"shippingAddress": "123 Test St, City, State 12345"}'
```

## Team Members

- **Daniel Reyes** - Scrum Master
- **Trenton Stafford** - Product Owner
- **Muhaimin Jobayer** - Backend, Database
- **Russel Scales** - Authentication, Security
- **Dominic Southivong** - Checkout, Reports

## License

This project is developed for educational purposes as part of the CTU course.
