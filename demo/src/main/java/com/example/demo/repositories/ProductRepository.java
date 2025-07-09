package com.example.demo.repositories;

import com.example.demo.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

    // --- MODIFIED START ---
    // The invalid custom @Query annotations have been removed.
    // Spring Data JPA will create the necessary queries from the method names.

    Page<Product> findByCategoryId(Long categoryId, Pageable pageable);

    Page<Product> findByBestsellerIsTrue(Pageable pageable);

    Page<Product> findByNewArrivalIsTrue(Pageable pageable);
    // --- MODIFIED END ---
}