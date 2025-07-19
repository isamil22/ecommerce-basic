// isamil22/ecommerce-basic/ecommerce-basic-71c6fa0046a0f3d47a9ee9dfa53fa2560484eb0f/demo/src/main/java/com/example/demo/dto/OrderDTO.java
package com.example.demo.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import com.example.demo.model.Order;

@Data
public class OrderDTO {
    private Long id;
    private Long userId;
    @NotBlank(message = "Full name is required") // ADDED
    private String clientFullName; // ADDED
    @NotBlank(message = "City is required") // ADDED
    private String city; // ADDED
    @NotBlank(message = "Address is required")
    private String address;
    @NotBlank(message = "Phone number is required")
    private String phoneNumber;
    private Order.OrderStatus status;
    private LocalDateTime createdAt;
    private List<OrderItemDTO> orderItems;
}
