// demo/src/main/java/com/example/demo/repositories/VariantTypeRepository.java
package com.example.demo.repositories;

import com.example.demo.model.VariantType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VariantTypeRepository extends JpaRepository<VariantType, Long> {
}