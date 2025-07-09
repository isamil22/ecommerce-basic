package com.example.demo.specification;

import com.example.demo.model.Product;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Component
public class ProductSpecification {

    public Specification<Product> getProducts(String search, BigDecimal minPrice, BigDecimal maxPrice, String brand, Boolean bestseller, Boolean newArrival, Long categoryId) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (search != null && !search.isEmpty()) {
                String searchTerm = "%" + search.toLowerCase() + "%";
                // Temporarily searching only by name to diagnose the issue
                Predicate nameLike = criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), searchTerm);
                predicates.add(nameLike);

                // The original code that searched both name and description is commented out below for testing.
                // Predicate descriptionLike = criteriaBuilder.like(criteriaBuilder.lower(root.get("description")), searchTerm);
                // predicates.add(criteriaBuilder.or(nameLike, descriptionLike));
            }

            if (minPrice != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("price"), minPrice));
            }

            if (maxPrice != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("price"), maxPrice));
            }

            if (brand != null && !brand.isEmpty()) {
                predicates.add(criteriaBuilder.equal(criteriaBuilder.lower(root.get("brand")), brand.toLowerCase()));
            }

            if (bestseller != null && bestseller) {
                predicates.add(criteriaBuilder.isTrue(root.get("bestseller")));
            }

            if (newArrival != null && newArrival) {
                predicates.add(criteriaBuilder.isTrue(root.get("newArrival")));
            }

            if (categoryId != null) {
                predicates.add(criteriaBuilder.equal(root.get("category").get("id"), categoryId));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}