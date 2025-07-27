package com.example.demo.dto;

import lombok.Data;

@Data
public class AnnouncementDTO {
    private String text;
    private String backgroundColor;
    private String textColor;
    private boolean enabled;
    private String animationType;
    private boolean isSticky; // New field for stickiness
    private String fontWeight; // New field for font weight
}
