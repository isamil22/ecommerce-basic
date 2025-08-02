package com.example.demo.repositories;

import com.example.demo.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for Product entity.
 */
@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

    // --- Existing Methods ---
    Page<Product> findByCategoryId(Long categoryId, Pageable pageable);

    Page<Product> findByBestsellerIsTrue(Pageable pageable);

    Page<Product> findByNewArrivalIsTrue(Pageable pageable);

    List<Product> findByNameContainingIgnoreCase(String name);

    // --- NEW METHOD ---
    /**
     * Finds all products that are marked as "packable".
     * This will be used to populate the "Build Your Own Pack" page for users.
     * @return A list of products where the isPackable flag is true.
     */
    List<Product> findByIsPackableTrue();
}