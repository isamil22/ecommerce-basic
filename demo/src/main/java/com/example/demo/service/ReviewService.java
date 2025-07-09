// src/main/java/com/example/demo/service/ReviewService.java
package com.example.demo.service;

import com.example.demo.dto.ReviewDTO;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.mapper.ReviewMapper;
import com.example.demo.model.Review;
import com.example.demo.model.User;
import com.example.demo.repositories.OrderRepository;
import com.example.demo.repositories.ReviewRepository;
import com.example.demo.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository; // Changed to check for any order
    private final ReviewMapper reviewMapper;

    public ReviewDTO addReview(Long userId, ReviewDTO reviewDTO) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Check if the user has purchased at least one product
        if (!orderRepository.existsByUserId(userId)) {
            throw new AccessDeniedException("You can only review our service after making a purchase.");
        }

        Review review = new Review();
        review.setUser(user);
        review.setContent(reviewDTO.getContent());
        review.setRating(reviewDTO.getRating());
        review.setApproved(false);

        Review savedReview = reviewRepository.save(review);
        return reviewMapper.toDTO(savedReview);
    }

    // getPendingReviews, approveReview, and deleteReview methods remain the same...
    public List<ReviewDTO> getPendingReviews() {
        return reviewRepository.findByApproved(false).stream()
                .map(reviewMapper::toDTO)
                .collect(Collectors.toList());
    }

    public List<ReviewDTO> getApprovedReviews() {
        return reviewRepository.findByApproved(true).stream()
                .map(reviewMapper::toDTO)
                .collect(Collectors.toList());
    }

    public ReviewDTO approveReview(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found"));
        review.setApproved(true);
        Review approvedReview = reviewRepository.save(review);
        return reviewMapper.toDTO(approvedReview);
    }

    public void deleteReview(Long reviewId) {
        if (!reviewRepository.existsById(reviewId)) {
            throw new ResourceNotFoundException("Review not found");
        }
        reviewRepository.deleteById(reviewId);
    }
}