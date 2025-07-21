package com.example.demo.service;

import com.example.demo.dto.CartDTO;
import com.example.demo.dto.OrderDTO;
import com.example.demo.exception.InsufficientStockException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.mapper.CartMapper;
import com.example.demo.mapper.OrderMapper;
import com.example.demo.model.*;
import com.example.demo.repositories.CouponRepository;
import com.example.demo.repositories.OrderRepository;
import com.example.demo.repositories.ProductRepository;
import com.example.demo.repositories.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.MailException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
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
    private final CouponRepository couponRepository;

    @Transactional
    public OrderDTO createOrder(Long userId, String address, String phoneNumber, String clientFullName, String city, String couponCode) {
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

        // ======================= FIX START =======================
        // The cart object from the mapper has products with only an ID.
        // We need to load the full product details for each cart item.
        for (CartItem item : cart.getItems()) {
            Product fullProduct = productRepository.findById(item.getProduct().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found in cart with ID: " + item.getProduct().getId()));
            item.setProduct(fullProduct);
        }
        // ======================== FIX END ========================

        Order order = new Order();
        order.setUser(user);
        order.setClientFullName(clientFullName);
        order.setCity(city);
        order.setAddress(address);
        order.setPhoneNumber(phoneNumber);
        order.setStatus(Order.OrderStatus.PREPARING);
        order.setCreatedAt(LocalDateTime.now());
        // Set a default shipping cost
        order.setShippingCost(new BigDecimal("10.00"));


        BigDecimal subtotal = calculateSubtotal(cart.getItems());

        if (couponCode != null && !couponCode.trim().isEmpty()) {
            Coupon coupon = couponRepository.findByCode(couponCode)
                    .orElseThrow(() -> new ResourceNotFoundException("Coupon not found: " + couponCode));

            // === Start of Validation Logic ===

            if (coupon.getExpiryDate().isBefore(LocalDateTime.now())) {
                throw new IllegalStateException("Coupon has expired.");
            }
            if (coupon.getUsageLimit() > 0 && coupon.getTimesUsed() >= coupon.getUsageLimit()) {
                throw new IllegalStateException("Coupon has reached its usage limit.");
            }
            if (coupon.getMinPurchaseAmount() != null && subtotal.compareTo(coupon.getMinPurchaseAmount()) < 0) {
                throw new IllegalStateException("Order total does not meet the minimum purchase amount for this coupon.");
            }

            // New: First-Time Customer Validation
            // Corrected method call from existsByUserId to existsByUser_Id
            if (coupon.isFirstTimeOnly() && orderRepository.existsByUser_Id(userId)) {
                throw new IllegalStateException("This coupon is for first-time customers only.");
            }

            // New: Product/Category Specific Validation
            boolean isApplicable = isCouponApplicableToCart(coupon, cart);
            if (!isApplicable) {
                throw new IllegalStateException("This coupon is not valid for the items in your cart.");
            }

            // === End of Validation Logic ===


            // === Start of Discount Calculation ===
            BigDecimal discountAmount = BigDecimal.ZERO;
            if (coupon.getDiscountType() == Coupon.DiscountType.FIXED_AMOUNT) {
                discountAmount = coupon.getDiscountValue();
            } else if (coupon.getDiscountType() == Coupon.DiscountType.PERCENTAGE) {
                // Apply percentage discount only on applicable items
                BigDecimal applicableSubtotal = getApplicableSubtotal(coupon, cart);
                discountAmount = applicableSubtotal.multiply(coupon.getDiscountValue().divide(new BigDecimal("100")));
            }

            // Handle Free Shipping
            if (coupon.getDiscountType() == Coupon.DiscountType.FREE_SHIPPING) {
                order.setShippingCost(BigDecimal.ZERO);
            }
            // === End of Discount Calculation ===

            order.setCoupon(coupon);
            order.setDiscountAmount(discountAmount);

            coupon.setTimesUsed(coupon.getTimesUsed() + 1);
            couponRepository.save(coupon);
        } else {
            order.setDiscountAmount(BigDecimal.ZERO);
        }

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

    private boolean isCouponApplicableToCart(Coupon coupon, Cart cart) {
        boolean productSpecific = coupon.getApplicableProducts() != null && !coupon.getApplicableProducts().isEmpty();
        boolean categorySpecific = coupon.getApplicableCategories() != null && !coupon.getApplicableCategories().isEmpty();

        // If not restricted by product or category, it's applicable to the whole cart
        if (!productSpecific && !categorySpecific) {
            return true;
        }

        return cart.getItems().stream().anyMatch(item -> {
            boolean matchesProduct = productSpecific && coupon.getApplicableProducts().contains(item.getProduct());
            boolean matchesCategory = categorySpecific && coupon.getApplicableCategories().contains(item.getProduct().getCategory());
            return matchesProduct || matchesCategory;
        });
    }

    private BigDecimal getApplicableSubtotal(Coupon coupon, Cart cart) {
        boolean productSpecific = coupon.getApplicableProducts() != null && !coupon.getApplicableProducts().isEmpty();
        boolean categorySpecific = coupon.getApplicableCategories() != null && !coupon.getApplicableCategories().isEmpty();

        if (!productSpecific && !categorySpecific) {
            return calculateSubtotal(cart.getItems()); // Apply to whole cart if no restrictions
        }

        return cart.getItems().stream()
                .filter(item -> {
                    boolean matchesProduct = productSpecific && coupon.getApplicableProducts().contains(item.getProduct());
                    boolean matchesCategory = categorySpecific && item.getProduct().getCategory() != null && coupon.getApplicableCategories().contains(item.getProduct().getCategory());
                    return matchesProduct || matchesCategory;
                })
                .map(item -> item.getProduct().getPrice().multiply(new BigDecimal(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal calculateSubtotal(List<CartItem> items) {
        return items.stream()
                .map(item -> item.getProduct().getPrice().multiply(new BigDecimal(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }


    @Transactional(readOnly = true)
    public List<OrderDTO> getAllOrders() {
        return orderMapper.toDTOs(orderRepository.findByDeleted(false));
    }

    public List<OrderDTO> getUserOrders(Long userId) {
        // Corrected method call from findByUserId to findByUser_Id
        return orderMapper.toDTOs(orderRepository.findByUser_Id(userId));
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
