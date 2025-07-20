// demo/src/main/java/com/example/demo/dto/CouponDTO.java

package com.example.demo.dto;

import com.example.demo.model.Coupon;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class CouponDTO {
    private Long id;
    private String name;
    private String code;
    private BigDecimal discountValue;
    private Coupon.DiscountType discountType;
    private LocalDateTime expiryDate;
    private Coupon.CouponType type; // Added this line
    private BigDecimal minPurchaseAmount;
    private Integer usageLimit;
    private Integer timesUsed;
    private boolean firstTimeOnly;
}