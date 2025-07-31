// demo/src/main/java/com/example/demo/mapper/ProductMapper.java
package com.example.demo.mapper;

import com.example.demo.dto.CommentDTO;
import com.example.demo.dto.ProductDTO;
import com.example.demo.dto.VariantTypeDto;
import com.example.demo.model.Comment;
import com.example.demo.model.Product;
import com.example.demo.model.VariantOption;
import com.example.demo.model.VariantType;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;

import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface ProductMapper {

    @Mapping(source = "category.name", target = "categoryName")
    @Mapping(source = "category.id", target = "categoryId")
    // --- MODIFICATION START ---
    // This tells MapStruct to use our custom logic for mapping these fields.
    @Mapping(source = "variantTypes", target = "variantTypes")
    @Mapping(source = "variants", target = "variants")
        // --- MODIFICATION END ---
    ProductDTO toDTO(Product product);

    @Mapping(target = "category", ignore = true)
    @Mapping(target = "variantTypes", ignore = true)
    @Mapping(target = "variants", ignore = true)
    Product toEntity(ProductDTO productDTO);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "comments", ignore = true)
    @Mapping(target = "images", ignore = true)
    @Mapping(target = "variantTypes", ignore = true)
    @Mapping(target = "variants", ignore = true)
    void updateProductFromDto(ProductDTO dto, @MappingTarget Product entity);

    // --- NEW MAPPING LOGIC START ---
    // This custom mapping converts a List<VariantType> to a List<VariantTypeDto>
    default List<VariantTypeDto> mapVariantTypes(List<VariantType> variantTypes) {
        if (variantTypes == null) {
            return null;
        }
        return variantTypes.stream()
                .map(this::variantTypeToVariantTypeDto)
                .collect(Collectors.toList());
    }

    // This maps a single VariantType entity to its DTO representation
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
    // --- NEW MAPPING LOGIC END ---

    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "userFullName", source = "user.fullName")
    CommentDTO toDTO(Comment comment);

    @Mapping(target = "user.id", source = "userId")
    @Mapping(target = "product", ignore = true)
    Comment toEntity(CommentDTO commentDTO);
}