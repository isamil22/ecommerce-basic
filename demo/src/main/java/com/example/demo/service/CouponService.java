// demo/src/main/java/com/example/demo/service/CouponService.java
package com.example.demo.service;

import com.example.demo.dto.CouponDTO;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.mapper.CouponMapper;
import com.example.demo.model.Coupon;
import com.example.demo.model.Order; // Import Order class
import com.example.demo.repositories.CouponRepository;
import com.example.demo.repositories.OrderRepository; // Import OrderRepository
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Set; // Import Set
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CouponService {

    private final CouponRepository couponRepository;
    private final CouponMapper couponMapper;
    private final OrderRepository orderRepository; // Inject OrderRepository

    @Transactional
    public CouponDTO createCoupon(CouponDTO couponDTO) {
        Coupon coupon = couponMapper.toEntity(couponDTO);
        // Ensure timesUsed is initialized for new coupons, as it's now an Integer
        if (coupon.getTimesUsed() == null) {
            coupon.setTimesUsed(0);
        }
        // Set a default coupon type if not provided from DTO
        // You might need to adjust 'Coupon.CouponType.USER' based on your application's default logic
        if (coupon.getType() == null) {
            coupon.setType(Coupon.CouponType.USER); // Added these lines
        }
        // Additional validation can be added here if needed
        Coupon savedCoupon = couponRepository.save(coupon);
        return couponMapper.toDTO(savedCoupon);
    }

    public CouponDTO validateCoupon(String code) {
        Coupon coupon = couponRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon with code " + code + " not found"));

        if (coupon.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new IllegalStateException("Coupon has expired");
        }

        return couponMapper.toDTO(coupon);
    }

    @Transactional(readOnly = true)
    public List<CouponDTO> getAllCoupons() {
        return couponRepository.findAll().stream()
                .map(couponMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional // Ensure this method is transactional for database operations
    public void deleteCoupon(Long id) {
        Coupon coupon = couponRepository.findById(id) // Fetch the coupon to ensure it exists and to get the object
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found with id: " + id)); //

        // Find all orders that use this coupon and set their coupon_id to null
        List<Order> associatedOrders = orderRepository.findByCoupon(coupon); //
        for (Order order : associatedOrders) { //
            order.setCoupon(null); //
            orderRepository.save(order); // Save the updated order
        }

        couponRepository.deleteById(id); // Now delete the coupon
    }

    public List<Map<String, Object>> getCouponUsageStatistics() {
        return orderRepository.countByCouponUsageByDay();
    }
}