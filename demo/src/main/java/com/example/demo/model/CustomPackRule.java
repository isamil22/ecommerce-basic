package com.example.demo.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CustomPackRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Minimum number of items required in the custom pack
    private int minItems;

    // Maximum number of items allowed in the custom pack
    private int maxItems;

    // A list of category IDs that are allowed to be added to this pack
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "pack_allowed_categories", joinColumns = @JoinColumn(name = "rule_id"))
    @Column(name = "category_id")
    private List<Long> allowedProductCategoryIds;

    // Links this rule set back to the one product it describes
    @JsonBackReference
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;
}