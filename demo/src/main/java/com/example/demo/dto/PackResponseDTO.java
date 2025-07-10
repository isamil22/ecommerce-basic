package com.example.demo.dto;

import lombok.Data;
import java.util.List;

@Data
public class PackResponseDTO {
    private Long id;
    private String name;
    private String description;
    private double price;
    private String imageUrl; // CORRECT: DTO includes the image URL for the frontend
    private List<PackItemResponseDTO> items;
}