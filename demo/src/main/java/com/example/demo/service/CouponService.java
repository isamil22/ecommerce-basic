// isamil22/ecommerce-basic/ecommerce-basic-0f55bfa61258d154774d02769dfa0c05f3c7e830/demo/src/main/java/com/example/demo/service/CouponService.java

package com.example.demo.service;

import com.example.demo.dto.CouponDTO;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.mapper.CouponMapper;
import com.example.demo.model.Coupon;
import com.example.demo.repositories.CouponRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List; // 👈 Import List
import java.util.stream.Collectors; // 👈 Import Collectors

@Service
@RequiredArgsConstructor
public class CouponService {

    private final CouponRepository couponRepository;
    private final CouponMapper couponMapper;

    public CouponDTO createCoupon(CouponDTO couponDTO) {
        Coupon coupon = couponMapper.toEntity(couponDTO);
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

    // 👇 ADD THIS METHOD
    public List<CouponDTO> getAllCoupons() {
        return couponRepository.findAll().stream()
                .map(couponMapper::toDTO)
                .collect(Collectors.toList());
    }
}