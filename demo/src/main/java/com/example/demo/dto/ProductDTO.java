// demo/src/main/java/com/example/demo/dto/ProductDTO.java
package com.example.demo.dto;

import com.example.demo.model.Product;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class ProductDTO {

    private Long id;

    @NotBlank(message = "Product name is required")
    private String name;

    @NotBlank(message = "Product description is required")
    private String description;

    @NotNull(message = "Price is required")
    @Positive(message = "Price must be positive")
    private BigDecimal price;

    @NotNull(message = "Quantity is required")
    @PositiveOrZero(message = "Quantity cannot be negative")
    private Integer quantity;

    private List<String> images;
    private List<CommentDTO> comments;
    private String brand;
    private boolean bestseller;
    private boolean newArrival;

    @NotNull(message = "Category ID is required for a product")
    private Long categoryId;

    private String categoryName;
    private Product.ProductType type;

    // These fields will now correctly reference the public DTO classes
    private List<VariantTypeDto> variantTypes;
    private List<ProductVariantDto> variants;
}