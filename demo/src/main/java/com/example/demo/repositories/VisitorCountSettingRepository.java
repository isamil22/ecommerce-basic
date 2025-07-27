package com.example.demo.repositories;



import com.example.demo.model.VisitorCountSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VisitorCountSettingRepository extends JpaRepository<VisitorCountSetting, Long> {
}
