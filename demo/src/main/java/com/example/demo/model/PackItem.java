package com.example.demo.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "pack_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PackItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonBackReference
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pack_id")
    private Pack pack;

    @ManyToOne(fetch = FetchType.LAZY) // CORRECTED
    @JoinColumn(name = "default_product_id", nullable = false)
    private Product defaultProduct;

    @ManyToMany(fetch = FetchType.LAZY) // CORRECTED
    @JoinTable(
            name = "pack_item_variations",
            joinColumns = @JoinColumn(name = "pack_item_id"),
            inverseJoinColumns = @JoinColumn(name = "product_id")
    )
    private List<Product> variationProducts = new ArrayList<>();
}