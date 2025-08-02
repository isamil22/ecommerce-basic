package com.example.demo.mapper;

import com.example.demo.dto.CustomPackRuleDto;
import com.example.demo.model.CustomPackRule;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

/**
 * Mapper for converting between CustomPackRule entity and CustomPackRuleDto.
 */
@Mapper(componentModel = "spring")
public interface CustomPackRuleMapper {

    CustomPackRuleMapper INSTANCE = Mappers.getMapper(CustomPackRuleMapper.class);

    /**
     * Converts a CustomPackRule entity to its DTO representation.
     * @param customPackRule The entity to convert.
     * @return The resulting DTO.
     */
    CustomPackRuleDto toDto(CustomPackRule customPackRule);

    /**
     * Converts a CustomPackRuleDto to its entity representation.
     * @param customPackRuleDto The DTO to convert.
     * @return The resulting entity.
     */
    CustomPackRule toEntity(CustomPackRuleDto customPackRuleDto);
}