package com.example.demo.dto;

import lombok.Data;

@Data
public class AnnouncementDTO {
    private String text;
    private String backgroundColor;
    private String textColor;
    private boolean enabled;
}