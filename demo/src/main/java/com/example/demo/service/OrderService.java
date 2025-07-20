package com.example.demo.service;

import com.example.demo.dto.CartDTO;
import com.example.demo.dto.OrderDTO;
import com.example.demo.exception.InsufficientStockException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.mapper.CartMapper;
import com.example.demo.mapper.OrderMapper;
import com.example.demo.model.*;
import com.example.demo.repositories.CouponRepository; // Import CouponRepository
import com.example.demo.repositories.OrderRepository;
import com.example.demo.repositories.ProductRepository;
import com.example.demo.repositories.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.MailException;
import org.springframework.stereotype.Service;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.math.BigDecimal; // Import BigDecimal
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final Logger logger = LoggerFactory.getLogger(OrderService.class);

    private final OrderRepository orderRepository;
    private final CartService cartService;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final OrderMapper orderMapper;
    private final CartMapper cartMapper;
    private final CouponRepository couponRepository; // Inject CouponRepository

    @Transactional
    public OrderDTO createOrder(Long userId, String address, String phoneNumber, String clientFullName, String city, String couponCode) { // Add couponCode parameter
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (!user.isEmailConfirmation()) {
            throw new IllegalStateException("Email not confirmed. Please confirm email before placing order");
        }
        CartDTO cartDTO = cartService.getCart(userId);
        Cart cart = cartMapper.toEntity(cartDTO);

        if (cart.getItems().isEmpty()) {
            throw new IllegalStateException("Cannot create an order with an empty cart");
        }

        Order order = new Order();
        order.setUser(user);
        order.setClientFullName(clientFullName);
        order.setCity(city);
        order.setAddress(address);
        order.setPhoneNumber(phoneNumber);
        order.setStatus(Order.OrderStatus.PREPARING);
        order.setCreatedAt(LocalDateTime.now());

        // ===== Apply Coupon Logic =====
        if (couponCode != null && !couponCode.trim().isEmpty()) {
            Coupon coupon = couponRepository.findByCode(couponCode)
                    .orElseThrow(() -> new ResourceNotFoundException("Coupon not found"));

            if (coupon.getExpiryDate().isBefore(LocalDateTime.now())) {
                throw new IllegalStateException("Coupon has expired");
            }
            order.setCoupon(coupon);
            order.setDiscountAmount(coupon.getDiscountValue());
        } else {
            order.setDiscountAmount(BigDecimal.ZERO);
        }
        // ============================

        List<OrderItem> orderItems = createOrderItems(cart, order);
        order.setItems(orderItems);

        Order savedOrder = orderRepository.save(order);
        cartService.clearCart(userId);

        try {
            emailService.sendOrderConfirmation(savedOrder);
        } catch (MailException e) {
            logger.error("Failed to send order confirmation email for order ID " + savedOrder.getId(), e);
        }
        return orderMapper.toDTO(savedOrder);
    }

    private List<OrderItem> createOrderItems(Cart cart, Order order) {
        return cart.getItems().stream().map(cartItem -> {
            Product product = productRepository.findById(cartItem.getProduct().getId())
                    .orElseThrow(() -> new EntityNotFoundException("Product not found with id: " + cartItem.getProduct().getId()));

            if (product.getQuantity() == null) {
                throw new IllegalStateException("Product quantity is not set for product " + product.getName());
            }
            if (product.getQuantity() < cartItem.getQuantity()) {
                throw new InsufficientStockException("Not enough stock for product " + product.getName());
            }
            product.setQuantity(product.getQuantity() - cartItem.getQuantity());
            productRepository.save(product);

            return new OrderItem(null, order, product, cartItem.getQuantity(), product.getPrice());
        }).collect(Collectors.toList());
    }

    public List<OrderDTO> getAllOrders() {
        return orderMapper.toDTOs(orderRepository.findByDeleted(false));
    }

    public List<OrderDTO> getUserOrders(Long userId) {
        return orderMapper.toDTOs(orderRepository.findByUserId(userId));
    }

    public OrderDTO updateOrderStatus(Long orderId, Order.OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        order.setStatus(status);
        Order updatedOrder = orderRepository.save(order);
        return orderMapper.toDTO(updatedOrder);
    }

    public void softDeleteOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        order.setDeleted(true);
        orderRepository.save(order);
    }

    public void restoreOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        order.setDeleted(false);
        orderRepository.save(order);
    }

    public List<OrderDTO> getDeletedOrders() {
        return orderMapper.toDTOs(orderRepository.findByDeleted(true));
    }

    public void deleteAllOrders() {
        orderRepository.deleteAll();
    }

    public String exportOrdersToCsv() {
        List<Order> orders = orderRepository.findByDeleted(false);
        StringWriter sw = new StringWriter();
        PrintWriter pw = new PrintWriter(sw);
        pw.println("Order ID,Customer Name,City,Address,Phone Number,Status,Created At");
        for (Order order : orders) {
            pw.println(String.join(",",
                    String.valueOf(order.getId()),
                    order.getClientFullName(),
                    order.getCity(),
                    order.getAddress(),
                    order.getPhoneNumber(),
                    String.valueOf(order.getStatus()),
                    String.valueOf(order.getCreatedAt())
            ));
        }
        return sw.toString();
    }
}