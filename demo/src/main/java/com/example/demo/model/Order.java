// isamil22/ecommerce-basic/ecommerce-basic-71c6fa0046a0f3d47a9ee9dfa53fa2560484eb0f/demo/src/main/java/com/example/demo/model/Order.java
package com.example.demo.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
// import org.apache.catalina.User; // REMOVE THIS LINE
import com.example.demo.model.User; // ADD THIS LINE

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name="orders")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user; // This will now correctly refer to your User entity

    private String clientFullName; // ADDED
    private String city; // ADDED
    private String address;
    private String phoneNumber;

    @Enumerated(EnumType.STRING)
    private OrderStatus status;

    public enum OrderStatus {
        PREPARING, DELIVERING, DELIVERED, CANCELED
    }

    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();
}