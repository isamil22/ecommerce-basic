package com.example.demo.service;

import com.example.demo.dto.CouponDTO;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.mapper.CouponMapper;
import com.example.demo.model.Coupon;
import com.example.demo.repositories.CouponRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

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
}