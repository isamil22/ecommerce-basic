package com.example.demo.repositories;

import com.example.demo.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByApproved(boolean approved);

    // --- ADD THIS LINE ---
    List<Review> findByUserId(Long userId);
}
