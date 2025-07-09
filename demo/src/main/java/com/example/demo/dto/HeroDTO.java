package com.example.demo.dto;

import lombok.Data;

@Data
public class HeroDTO {
    private Long id;
    private String title;
    private String subtitle;
    private String linkText;
    private String linkUrl;
    private String imageUrl;
}