package com.example.demo.repositories;

import com.example.demo.model.CustomPack;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomPackRepository extends JpaRepository<CustomPack, Long> {
}