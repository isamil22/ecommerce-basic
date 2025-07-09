package com.example.demo.mapper;

import com.example.demo.dto.ReviewDTO;
import com.example.demo.model.Review;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ReviewMapper {
    /**
     * Maps a Review entity to a ReviewDTO.
     * It includes user information but omits the product details, as they are no longer part of the model.
     */
    @Mapping(source = "user.id", target = "userId")
    @Mapping(source = "user.email", target = "userEmail")
    ReviewDTO toDTO(Review review);

    /**
     * Maps a ReviewDTO back to a Review entity.
     * The product mapping has been removed.
     */
    @Mapping(source = "userId", target = "user.id")
    Review toEntity(ReviewDTO reviewDTO);
}