package com.example.demo.controller;

import com.example.demo.dto.OrderDTO;
import com.example.demo.model.Order;
import com.example.demo.model.User;
import com.example.demo.service.OrderService;
import com.example.demo.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {
    private final OrderService orderService;
    private final UserService userService;

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<OrderDTO> createOrder(@AuthenticationPrincipal UserDetails userDetails,
                                                @RequestParam String clientFullName,
                                                @RequestParam String city,
                                                @RequestParam String address,
                                                @RequestParam String phoneNumber,
                                                @RequestParam(required = false) String couponCode) {
        Long userId = ((User) userDetails).getId();
        OrderDTO orderDTO = orderService.createOrder(userId, address, phoneNumber, clientFullName, city, couponCode);
        return ResponseEntity.ok(orderDTO);
    }

    @PostMapping("/guest")
    public ResponseEntity<OrderDTO> createGuestOrder(@RequestParam String clientFullName,
                                                     @RequestParam String city,
                                                     @RequestParam String address,
                                                     @RequestParam String phoneNumber,
                                                     @RequestParam String email,
                                                     @RequestParam(required = false) String couponCode) {
        OrderDTO orderDTO = orderService.createGuestOrder(address, phoneNumber, clientFullName, city, email, couponCode);
        return ResponseEntity.ok(orderDTO);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<OrderDTO>> getAllOrders() {
        List<OrderDTO> orders = orderService.getAllOrders();
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/user")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<OrderDTO>> getUserOrders(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = ((User) userDetails).getId();
        List<OrderDTO> orders = orderService.getUserOrders(userId);
        return ResponseEntity.ok(orders);
    }

    @PutMapping("/{orderId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OrderDTO> updateOrderStatus(@PathVariable Long orderId,
                                                      @RequestParam Order.OrderStatus status) {
        OrderDTO updatedOrder = orderService.updateOrderStatus(orderId, status);
        return ResponseEntity.ok(updatedOrder);
    }

    @DeleteMapping("/{orderId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long orderId) {
        orderService.softDeleteOrder(orderId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{orderId}/restore")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> restoreOrder(@PathVariable Long orderId) {
        orderService.restoreOrder(orderId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/deleted")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<OrderDTO>> getDeletedOrders() {
        List<OrderDTO> orders = orderService.getDeletedOrders();
        return ResponseEntity.ok(orders);
    }

    @DeleteMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteAllOrders() {
        orderService.deleteAllOrders();
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/export")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> exportOrders() {
        String csv = orderService.exportOrdersToCsv();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"orders.csv\"")
                .contentType(org.springframework.http.MediaType.TEXT_PLAIN)
                .body(csv);
    }
}