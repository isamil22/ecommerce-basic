package com.example.demo.dto;

import lombok.Data;
import java.util.List;

@Data
public class CustomPackRuleDto {
    private int minItems;
    private int maxItems;
    private List<Long> allowedProductCategoryIds;
}