package com.example.demo.mapper;

import com.example.demo.dto.ProductVariantDto;
import com.example.demo.dto.VariantTypeDto;
import com.example.demo.model.ProductVariant;
import com.example.demo.model.VariantType;
import org.mapstruct.Mapper;

import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface VariantMapper {

    ProductVariantDto toDto(ProductVariant variant);

    ProductVariant toEntity(ProductVariantDto dto);

    // Although not strictly required by your current ProductService,
    // it's good practice to include mappers for VariantType as well.
    default VariantTypeDto variantTypeToDto(VariantType variantType) {
        if (variantType == null) {
            return null;
        }
        VariantTypeDto dto = new VariantTypeDto();
        dto.setName(variantType.getName());
        dto.setOptions(variantType.getOptions().stream()
                .map(option -> option.getValue())
                .collect(Collectors.toList()));
        return dto;
    }

    List<VariantTypeDto> toVariantTypeDtoList(List<VariantType> variantTypes);
}