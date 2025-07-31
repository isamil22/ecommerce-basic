// demo/src/main/java/com/example/demo/repositories/ProductVariantRepository.java
package com.example.demo.repositories;

import com.example.demo.model.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {
}