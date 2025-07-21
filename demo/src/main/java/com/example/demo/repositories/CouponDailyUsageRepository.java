package com.example.demo.repositories;

import com.example.demo.model.Coupon;
import com.example.demo.model.CouponDailyUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface CouponDailyUsageRepository extends JpaRepository<CouponDailyUsage, Long> {
    Optional<CouponDailyUsage> findByCouponAndDate(Coupon coupon, LocalDate date);
    List<CouponDailyUsage> findByCoupon(Coupon coupon);
}
