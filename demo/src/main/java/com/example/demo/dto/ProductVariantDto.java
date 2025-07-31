// demo/src/main/java/com/example/demo/dto/ProductVariantDto.java
package com.example.demo.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.Map;

@Data
public class ProductVariantDto {
    private Map<String, String> variantMap;
    private BigDecimal price;
    private int stock;
    private String imageUrl;
}