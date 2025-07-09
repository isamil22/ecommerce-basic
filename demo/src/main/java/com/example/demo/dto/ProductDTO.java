package com.example.demo.dto;

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
    @Positive(message = "Cannot be negative")
    private BigDecimal price;
    @PositiveOrZero(message = "Cannot be negative")
    private Integer quantity;

    private List<String> images;

    private List<CommentDTO> comments;

    @NotBlank(message = "Brand is required")
    private String brand;
    private boolean bestseller;
    private boolean newArrival; // Added for new arrivals

    @NotNull(message = "Category ID is required for a product")
    private Long categoryId;

    private String categoryName;
}