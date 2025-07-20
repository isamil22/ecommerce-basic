package com.example.demo.dto;

import com.example.demo.model.Order;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal; // Import BigDecimal
import java.time.LocalDateTime;
import java.util.List;

@Data
public class OrderDTO {
    private Long id;
    private Long userId;
    @NotBlank(message = "Full name is required")
    private String clientFullName;
    @NotBlank(message = "City is required")
    private String city;
    @NotBlank(message = "Address is required")
    private String address;
    @NotBlank(message = "Phone number is required")
    private String phoneNumber;
    private Order.OrderStatus status;
    private LocalDateTime createdAt;
    private List<OrderItemDTO> orderItems;

    // --- NEW FIELDS START ---

    private BigDecimal discountAmount;
    private String couponCode;

    // --- NEW FIELDS END ---
}