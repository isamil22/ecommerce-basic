// demo/src/main/java/com/example/demo/dto/CouponDTO.java

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
    private Coupon.DiscountType discountType; // ADD THIS
    private LocalDateTime expiryDate;
    private Coupon.CouponType type;
    private BigDecimal minPurchaseAmount; // ADD THIS
    private int usageLimit; // ADD THIS
    private int timesUsed; // ADD THIS
    private boolean firstTimeOnly; // ADD THIS
}