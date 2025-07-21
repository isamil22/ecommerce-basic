// demo/src/main/java/com/example/demo/repositories/OrderRepository.java
package com.example.demo.repositories;

import com.example.demo.model.Order;
import com.example.demo.model.User;
import com.example.demo.model.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserAndDeletedFalseOrderByCreatedAtDesc(User user);

    List<Order> findByDeletedFalseOrderByCreatedAtDesc();

    Optional<Order> findByIdAndDeletedFalse(Long orderId);

    List<Order> findByCoupon(Coupon coupon);

    // Add these methods:
    // This will allow finding orders by the ID of the associated User.
    List<Order> findByUser_Id(Long userId);

    // This will allow checking for the existence of orders by a specific User ID.
    boolean existsByUser_Id(Long userId);

    // This will allow finding orders based on their 'deleted' status.
    List<Order> findByDeleted(boolean deleted);

    @Query("SELECT FUNCTION('DATE', o.createdAt) as date, COUNT(o) as count FROM Order o WHERE o.coupon IS NOT NULL GROUP BY FUNCTION('DATE', o.createdAt)")
    List<Map<String, Object>> countByCouponUsageByDay();
}