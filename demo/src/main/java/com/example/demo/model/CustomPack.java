package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;

@Entity
@Data
public class CustomPack {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String description;
    private int minItems;
    private int maxItems;

    @Enumerated(EnumType.STRING)
    private PricingType pricingType;

    private BigDecimal fixedPrice; // For FIXED pricing type
    private BigDecimal discountRate; // For DYNAMIC pricing type (e.g., 0.2 for 20%)

    public enum PricingType {
        FIXED, DYNAMIC
    }
}
