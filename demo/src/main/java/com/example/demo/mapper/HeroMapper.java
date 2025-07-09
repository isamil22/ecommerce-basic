package com.example.demo.mapper;

import com.example.demo.dto.HeroDTO;
import com.example.demo.model.Hero;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface HeroMapper {
    HeroDTO toDTO(Hero hero);
    Hero toEntity(HeroDTO heroDTO);
}