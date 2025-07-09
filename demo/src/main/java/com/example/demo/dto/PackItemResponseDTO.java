package com.example.demo.dto;

import lombok.Data;
import java.util.List;

@Data
public class PackItemResponseDTO {
    private Long id;
    private ProductDTO defaultProduct;
    private List<ProductDTO> variationProducts;
}