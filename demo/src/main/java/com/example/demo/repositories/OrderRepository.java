// src/main/java/com/example/demo/repositories/OrderRepository.java
package com.example.demo.repositories;

import com.example.demo.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserId(Long userId);

    // Check if any orders exist for a given user ID
    boolean existsByUserId(Long userId);
}