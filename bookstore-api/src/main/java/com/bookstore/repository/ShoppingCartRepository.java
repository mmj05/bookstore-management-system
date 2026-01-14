package com.bookstore.repository;

import com.bookstore.entity.ShoppingCart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ShoppingCartRepository extends JpaRepository<ShoppingCart, Long> {
    
    Optional<ShoppingCart> findByUserId(Long userId);
    
    @Query("SELECT c FROM ShoppingCart c LEFT JOIN FETCH c.items WHERE c.user.id = :userId")
    Optional<ShoppingCart> findByUserIdWithItems(@Param("userId") Long userId);
    
    @Query("SELECT c FROM ShoppingCart c LEFT JOIN FETCH c.items ci LEFT JOIN FETCH ci.book WHERE c.user.id = :userId")
    Optional<ShoppingCart> findByUserIdWithItemsAndBooks(@Param("userId") Long userId);
    
    boolean existsByUserId(Long userId);
}
