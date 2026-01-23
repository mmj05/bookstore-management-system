# Bookstore Management System

## Group 2 Project - CS492

A web-based bookstore management system with inventory tracking, online book browsing, shopping cart, order management, and user administration.

## Team Members

- **Tyler Barnett** - Product Owner
- **Daniel Reyes** - Scrum Master
- **Muhaimin Jobayer** - Development Team
- **Matthew Parra** - Development Team
- **Russel Scales** - Development Team

## Technology Stack

### Backend
- Java 17
- Spring Boot 3.2.1
- Spring Security with JWT Authentication
- Spring Data JPA
- PostgreSQL Database

### Frontend
- React 18
- React Router DOM
- Axios
- Vite

## Features

### Sprint 1 (Completed)
- **US-01**: Inventory Tracking System - CRUD operations for books
- **US-02**: Book Categorization - Manage categories and assign to books
- **US-04**: Customer Registration and Login - Secure authentication
- **US-05**: Online Book Browsing - Search, filter, and sort books
- **US-06**: Shopping Cart and Checkout - Cash on Delivery payment
- **US-09**: User Authentication Security - Password hashing, account lockout

### Sprint 2 (Completed)
- **US-03**: Inventory Reports - Stock levels, valuation, best sellers
- **US-07**: Order Tracking - Order history and status updates
- **US-08**: Admin User Management - Create users, assign roles, activate/deactivate
- **US-10**: Data Protection - Role-based access control

## Prerequisites

1. **Java 17** or higher
2. **Node.js 18** or higher
3. **PostgreSQL 15** or higher
4. **Maven** (for building the backend)

## Setup Instructions

### 1. Database Setup

Connect to PostgreSQL and run:

```sql
CREATE DATABASE bookstore_db;
CREATE USER bookstore_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE bookstore_db TO bookstore_user;
```

### 2. Backend Setup

Navigate to the backend directory:

```bash
cd bookstore-api
```

Edit `src/main/resources/application.properties` with your database credentials:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/bookstore_db
spring.datasource.username=bookstore_user
spring.datasource.password=your_password

# Generate a secure JWT secret (base64 encoded, at least 256 bits)
jwt.secret=YOUR_BASE64_ENCODED_SECRET_KEY
```

Build and run the backend:

```bash
mvn clean install
mvn spring-boot:run
```

The API will start at `http://localhost:8080`

### 3. Frontend Setup

Navigate to the frontend directory:

```bash
cd bookstore-frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will start at `http://localhost:5173`

## Default Test Accounts

On first run, the following accounts are created automatically:

| Email | Password | Role |
|-------|----------|------|
| admin@bookstore.com | Admin@123 | ADMINISTRATOR |
| manager@bookstore.com | Manager@123 | MANAGER |
| customer@example.com | Customer@123 | CUSTOMER |

## User Roles and Permissions

### Customer
- Browse and search books
- Add books to cart
- Checkout with Cash on Delivery
- View and cancel orders
- Manage profile

### Manager
- All customer permissions
- Manage inventory (add/edit/delete books)
- Manage categories
- View and update order status
- View inventory and sales reports

### Administrator
- All manager permissions
- Create and manage user accounts
- Assign roles to users
- Activate/deactivate accounts
- Unlock locked accounts

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new customer
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh token

### Books (Public)
- `GET /api/books` - List all books (paginated)
- `GET /api/books/{id}` - Get book by ID
- `GET /api/books/search` - Search books
- `GET /api/books/filter` - Advanced search with filters

### Books (Manager/Admin)
- `POST /api/books` - Create book
- `PUT /api/books/{id}` - Update book
- `PATCH /api/books/{id}/quantity` - Update quantity
- `DELETE /api/books/{id}` - Delete book

### Categories
- `GET /api/categories` - List categories
- `POST /api/categories` - Create category (Manager)
- `PUT /api/categories/{id}` - Update category (Manager)
- `DELETE /api/categories/{id}` - Delete category (Manager)

### Shopping Cart (Customer)
- `GET /api/cart` - Get cart
- `POST /api/cart/items` - Add item
- `PUT /api/cart/items/{bookId}` - Update quantity
- `DELETE /api/cart/items/{bookId}` - Remove item

### Orders
- `GET /api/orders` - My orders (Customer)
- `POST /api/orders/checkout` - Place order (Customer)
- `POST /api/orders/{id}/cancel` - Cancel order
- `GET /api/orders/all` - All orders (Manager)
- `PUT /api/orders/{id}/status` - Update status (Manager)

### Users (Admin)
- `GET /api/users` - List all users
- `POST /api/users` - Create user
- `PUT /api/users/{id}/role` - Update role
- `POST /api/users/{id}/activate` - Activate user
- `POST /api/users/{id}/deactivate` - Deactivate user

### Reports (Manager/Admin)
- `GET /api/reports/inventory` - Inventory report
- `GET /api/reports/sales` - Sales report

## Security Features

- JWT-based authentication (15-min access tokens, 7-day refresh tokens)
- BCrypt password hashing with 12 salt rounds
- Account lockout after 5 failed login attempts (15-minute lockout)
- Role-based access control (RBAC)
- Session timeout after 30 minutes of inactivity

## Project Structure

```
bookstore-api/
├── src/main/java/com/bookstore/
│   ├── config/           # Security & data initialization
│   ├── controller/       # REST API endpoints
│   ├── dto/              # Request/Response DTOs
│   ├── entity/           # JPA entities
│   ├── exception/        # Custom exceptions
│   ├── repository/       # Data access layer
│   ├── security/         # JWT authentication
│   └── service/          # Business logic
└── pom.xml

bookstore-frontend/
├── src/
│   ├── components/       # Reusable components
│   ├── context/          # React contexts (Auth, Cart)
│   ├── pages/            # Page components
│   ├── services/         # API service
│   ├── App.jsx           # Main app with routing
│   └── main.jsx          # Entry point
├── index.html
└── package.json
```

## License

This project is developed for educational purposes as part of CS492 at CTU.