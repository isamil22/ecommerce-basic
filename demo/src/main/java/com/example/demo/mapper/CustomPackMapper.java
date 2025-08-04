package com.example.demo.mapper;

import com.example.demo.dto.CustomPackDTO;
import com.example.demo.model.CustomPack;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CustomPackMapper {
    CustomPackDTO toDTO(CustomPack customPack);
    CustomPack toEntity(CustomPackDTO customPackDTO);
}