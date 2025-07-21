package com.example.demo.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class CouponDailyUsageDTO {
    private Long id;
    private Long couponId;
    private LocalDate date;
    private int usageCount;
}
