package com.example.demo.mapper;

import com.example.demo.dto.CommentDTO;
import com.example.demo.dto.ProductDTO;
import com.example.demo.dto.ProductVariantDto;
import com.example.demo.dto.VariantTypeDto;
import com.example.demo.model.*;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface ProductMapper {

    @Mapping(source = "category.name", target = "categoryName")
    @Mapping(source = "category.id", target = "categoryId")
    @Mapping(source = "variantTypes", target = "variantTypes")
    @Mapping(source = "variants", target = "variants")
    @Mapping(source = "hasVariants", target = "hasVariants")
    ProductDTO toDTO(Product product);

    @Mapping(target = "category", ignore = true)
    @Mapping(target = "variantTypes", ignore = true)
    @Mapping(target = "variants", ignore = true)
    @Mapping(target = "comments", ignore = true)
    @Mapping(target = "id", ignore = true)
    Product toEntity(ProductDTO productDTO);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "comments", ignore = true)
    @Mapping(target = "images", ignore = true)
    @Mapping(target = "variantTypes", ignore = true)
    @Mapping(target = "variants", ignore = true)
    void updateProductFromDto(ProductDTO dto, @MappingTarget Product entity);

    // ✅ Existing VariantType mapping (working correctly)
    default List<VariantTypeDto> mapVariantTypes(List<VariantType> variantTypes) {
        if (variantTypes == null) {
            return null;
        }
        return variantTypes.stream()
                .map(this::variantTypeToVariantTypeDto)
                .collect(Collectors.toList());
    }

    default VariantTypeDto variantTypeToVariantTypeDto(VariantType variantType) {
        if (variantType == null) {
            return null;
        }
        VariantTypeDto variantTypeDto = new VariantTypeDto();
        variantTypeDto.setName(variantType.getName());
        variantTypeDto.setOptions(variantType.getOptions().stream()
                .map(VariantOption::getValue)
                .collect(Collectors.toList()));
        return variantTypeDto;
    }

    // 🔧 ProductVariant mapping methods
    default List<ProductVariantDto> mapProductVariants(List<ProductVariant> productVariants) {
        if (productVariants == null) {
            return null;
        }
        return productVariants.stream()
                .map(this::productVariantToProductVariantDto)
                .collect(Collectors.toList());
    }

    default ProductVariantDto productVariantToProductVariantDto(ProductVariant productVariant) {
        if (productVariant == null) {
            return null;
        }
        ProductVariantDto dto = new ProductVariantDto();
        dto.setVariantMap(productVariant.getVariantMap());
        dto.setPrice(productVariant.getPrice());
        dto.setStock(productVariant.getStock());
        dto.setImageUrl(productVariant.getImageUrl());
        return dto;
    }

    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "userFullName", source = "user.fullName")
    CommentDTO toDTO(Comment comment);

    @Mapping(target = "user.id", source = "userId")
    @Mapping(target = "product", ignore = true)
    Comment toEntity(CommentDTO commentDTO);
}