package com.example.demo.repositories;

import com.example.demo.model.CustomPackRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository interface for CustomPackRule entity.
 * This provides standard CRUD (Create, Read, Update, Delete) operations.
 */
@Repository
public interface CustomPackRuleRepository extends JpaRepository<CustomPackRule, Long> {
    // No custom methods are needed here yet.
    // JpaRepository provides all the necessary methods like save(), findById(), etc.
}