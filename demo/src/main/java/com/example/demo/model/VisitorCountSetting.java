package com.example.demo.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.Data;

@Entity
@Data
public class VisitorCountSetting {

    @Id
    private Long id = 1L; // Using a fixed ID to ensure there's only one settings entry

    private boolean enabled;
    private int min;
    private int max;
}