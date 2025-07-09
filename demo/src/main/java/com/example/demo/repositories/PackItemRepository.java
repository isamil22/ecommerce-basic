package com.example.demo.repositories;

import com.example.demo.model.PackItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PackItemRepository extends JpaRepository<PackItem, Long> {
}