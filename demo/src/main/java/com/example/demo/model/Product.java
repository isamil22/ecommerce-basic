// demo/src/main/java/com/example/demo/model/Product.java

package com.example.demo.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String description;

    private BigDecimal price;
    private Integer quantity;

    @ElementCollection
    private List<String> images = new ArrayList<>();

    private String brand;
    private boolean bestseller;
    private boolean newArrival;

    @Enumerated(EnumType.STRING)
    private ProductType type;

    @JsonManagedReference
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Comment> comments = new ArrayList<>();

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    // ---MODIFICATION HERE---
    public enum ProductType {
        MEN, WOMEN, BOTH
    }
}