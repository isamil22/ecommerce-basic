package com.example.demo.repositories;

import com.example.demo.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

    Page<Product> findByCategoryId(Long categoryId, Pageable pageable);

    Page<Product> findByBestsellerIsTrue(Pageable pageable);

    Page<Product> findByNewArrivalIsTrue(Pageable pageable);

    List<Product> findByNameContainingIgnoreCase(String name);

    List<Product> findByIsPackableTrue();
}