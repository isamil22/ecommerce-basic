// isamil22/ecommerce-basic/ecommerce-basic-de52fb3f9923420c0ceb538f0eea6ad24aa94a25/demo/src/main/java/com/example/demo/controller/CouponController.java
package com.example.demo.controller;

import com.example.demo.dto.CouponDTO;
import com.example.demo.service.CouponService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

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

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<CouponDTO>> getAllCoupons() {
        List<CouponDTO> coupons = couponService.getAllCoupons();
        return ResponseEntity.ok(coupons);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCoupon(@PathVariable Long id) {
        couponService.deleteCoupon(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/usage-statistics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getCouponUsageStatistics() {
        return ResponseEntity.ok(couponService.getCouponUsageStatistics());
    }

    // --- NEW ENDPOINT START ---
    @GetMapping("/{id}/usage-statistics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getCouponUsageStatisticsById(@PathVariable Long id) {
        return ResponseEntity.ok(couponService.getCouponUsageStatisticsById(id));
    }
    // --- NEW ENDPOINT END ---
}