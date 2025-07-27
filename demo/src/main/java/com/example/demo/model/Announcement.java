package com.example.demo.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.Data;

@Entity
@Data
public class Announcement {
    @Id
    private Long id = 1L; // Singleton entity
    private String text;
    private String backgroundColor;
    private String textColor;
    private boolean enabled;
    private String animationType; // New field for animation
}
