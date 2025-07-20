package com.example.demo.controller;

import com.example.demo.dto.CouponDTO;
import com.example.demo.service.CouponService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/coupons")
@RequiredArgsConstructor
public class CouponController {

    private final CouponService couponService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CouponDTO> createCoupon(@RequestBody CouponDTO couponDTO) {
        CouponDTO createdCoupon = couponService.createCoupon(couponDTO);
        return new ResponseEntity<>(createdCoupon, HttpStatus.CREATED);
    }

    @GetMapping("/validate/{code}")
    public ResponseEntity<CouponDTO> validateCoupon(@PathVariable String code) {
        try {
            CouponDTO validatedCoupon = couponService.validateCoupon(code);
            return ResponseEntity.ok(validatedCoupon);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null); // Or a custom error response
        }
    }
}