package com.example.demo.mapper;

import com.example.demo.dto.CouponDailyUsageDTO;
import com.example.demo.model.CouponDailyUsage;
import org.springframework.stereotype.Component;

@Component
public class CouponDailyUsageMapper {

    public CouponDailyUsageDTO toCouponDailyUsageDTO(CouponDailyUsage couponDailyUsage) {
        CouponDailyUsageDTO dto = new CouponDailyUsageDTO();
        dto.setId(couponDailyUsage.getId());
        dto.setCouponId(couponDailyUsage.getCoupon().getId());
        dto.setDate(couponDailyUsage.getDate());
        dto.setUsageCount(couponDailyUsage.getUsageCount());
        return dto;
    }
}
