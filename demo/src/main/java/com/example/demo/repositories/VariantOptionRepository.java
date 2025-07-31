// demo/src/main/java/com/example/demo/repositories/VariantOptionRepository.java
package com.example.demo.repositories;

import com.example.demo.model.VariantOption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VariantOptionRepository extends JpaRepository<VariantOption, Long> {
}
