package com.example.demo.dto;

import com.example.demo.model.Coupon;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class CouponDTO {
    private Long id;
    private String code;
    private BigDecimal discountValue;
    private LocalDateTime expiryDate;
    private Coupon.CouponType type;
}
