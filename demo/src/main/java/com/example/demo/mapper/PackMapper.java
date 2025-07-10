package com.example.demo.mapper;

import com.example.demo.dto.PackResponseDTO;
import com.example.demo.model.Pack;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = {PackItemMapper.class})
public interface PackMapper {
    PackResponseDTO toResponseDTO(Pack pack);
}