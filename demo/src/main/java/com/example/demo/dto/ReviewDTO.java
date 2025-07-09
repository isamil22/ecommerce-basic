package com.example.demo.dto;

import lombok.Data;

@Data
public class ReviewDTO {
    private Long id;
    private String content;
    private int rating;
    private boolean approved;
    private Long userId;
    private String userEmail;
    // The productId and productName fields have been removed as they are no longer needed.
}