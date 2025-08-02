package com.example.demo.mapper;

import com.example.demo.dto.ProductDTO;
import com.example.demo.model.Product;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

/**
 * Mapper for converting between Product entity and ProductDTO.
 * It now uses mappers for comments, variants, and the new custom pack rules.
 */
@Mapper(componentModel = "spring", uses = {CommentMapper.class, VariantMapper.class, CustomPackRuleMapper.class})
public interface ProductMapper {

    /**
     * Converts a Product entity to a ProductDTO.
     * It maps the category ID and name from the nested Category object.
     * @param product The Product entity.
     * @return The corresponding ProductDTO.
     */
    @Mapping(source = "category.id", target = "categoryId")
    @Mapping(source = "category.name", target = "categoryName")
    ProductDTO toDto(Product product);

    /**
     * Converts a ProductDTO to a Product entity.
     * It maps the categoryId from the DTO to the nested Category object's ID.
     * @param productDTO The ProductDTO.
     * @return The corresponding Product entity.
     */
    @Mapping(source = "categoryId", target = "category.id")
    Product toEntity(ProductDTO productDTO);

    /**
     * Converts a list of Product entities to a list of ProductDTOs.
     * @param products The list of Product entities.
     * @return The list of corresponding ProductDTOs.
     */
    List<ProductDTO> toDtoList(List<Product> products);

    /**
     * Converts a list of ProductDTOs to a list of Product entities.
     * @param productDTOs The list of ProductDTOs.
     * @return The list of corresponding Product entities.
     */
    List<Product> toEntityList(List<ProductDTO> productDTOs);
}