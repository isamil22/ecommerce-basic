// demo/src/main/java/com/example/demo/model/Coupon.java
package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "coupons")
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique = true, nullable = false)
    private String code;

    @Column
    private BigDecimal discountValue; // Can be null for free shipping

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DiscountType discountType;

    @Column(nullable = false)
    private LocalDateTime expiryDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CouponType type;

    @Column
    private BigDecimal minPurchaseAmount;

    @Column
    private Integer usageLimit; // Changed from int to Integer

    @Column
    private Integer timesUsed; // Changed from int to Integer

    @Column(nullable = false)
    private boolean firstTimeOnly = false; // New: For first-time customer offers

    @ManyToMany
    @JoinTable(
            name = "coupon_products",
            joinColumns = @JoinColumn(name = "coupon_id"),
            inverseJoinColumns = @JoinColumn(name = "product_id")
    )
    private Set<Product> applicableProducts;

    @ManyToMany // New: For category-specific coupons
    @JoinTable(
            name = "coupon_categories",
            joinColumns = @JoinColumn(name = "coupon_id"),
            inverseJoinColumns = @JoinColumn(name = "category_id")
    )
    private Set<Category> applicableCategories; // New: For category-specific coupons


    public enum CouponType {
        INFLUENCER,
        USER
    }

    public enum DiscountType {
        FIXED_AMOUNT,
        PERCENTAGE,
        FREE_SHIPPING // New: For free shipping offers
    }
}
