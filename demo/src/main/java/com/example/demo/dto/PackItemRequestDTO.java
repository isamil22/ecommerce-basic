package com.example.demo.dto;


import lombok.Data;
import java.util.List;

@Data
public class PackItemRequestDTO {
    private Long defaultProductId;
    private List<Long> variationProductIds;
}