package com.example.demo.mapper;

import com.example.demo.dto.PackItemResponseDTO;
import com.example.demo.model.PackItem;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = {ProductMapper.class})
public interface PackItemMapper {
    PackItemResponseDTO toResponseDTO(PackItem packItem);
}