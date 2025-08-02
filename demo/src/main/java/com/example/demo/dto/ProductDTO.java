package com.example.demo.dto;

import com.example.demo.model.Product;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

@Data
public class ProductDTO {

    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private Integer quantity;
    private List<String> images; // For response
    private List<MultipartFile> imageFiles; // For request
    private String brand;
    private boolean bestseller;
    private boolean newArrival;
    private Long categoryId;
    private String categoryName;
    private Product.ProductType type;
    private boolean hasVariants;
    private List<VariantTypeDto> variantTypes;
    private List<ProductVariantDto> variants;
    private List<CommentDTO> comments;

    // --- NEWLY ADDED/UPDATED FIELDS ---
    /**
     * Flag indicating if this product can be used as a base for a custom pack.
     */
    private boolean isPackable;

    /**
     * The rules for the custom pack. This will only be populated if isPackable is true.
     */
    private CustomPackRuleDto customPackRule;
    // ------------------------------------
}