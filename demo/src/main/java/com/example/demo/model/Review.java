// src/main/java/com/example/demo/model/Review.java
package com.example.demo.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String content;

    private int rating; // e.g., 1 to 5 stars

    private boolean approved = false;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // The relationship to a specific Product has been removed
}

