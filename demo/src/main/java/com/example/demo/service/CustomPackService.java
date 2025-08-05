package com.example.demo.service;

import com.example.demo.dto.CustomPackDTO;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.mapper.CustomPackMapper;
import com.example.demo.model.CustomPack;
import com.example.demo.repositories.CustomPackRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // Import this

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomPackService {

    private final CustomPackRepository customPackRepository;
    private final CustomPackMapper customPackMapper;

    public CustomPackDTO createCustomPack(CustomPackDTO customPackDTO) {
        CustomPack customPack = customPackMapper.toEntity(customPackDTO);
        CustomPack savedCustomPack = customPackRepository.save(customPack);
        return customPackMapper.toDTO(savedCustomPack);
    }

    public List<CustomPackDTO> getAllCustomPacks() {
        return customPackRepository.findAll().stream()
                .map(customPackMapper::toDTO)
                .collect(Collectors.toList());
    }

    public CustomPackDTO getCustomPackById(Long id) {
        CustomPack customPack = customPackRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CustomPack not found with id: " + id));
        return customPackMapper.toDTO(customPack);
    }

    // --- ADD THIS METHOD ---
    @Transactional
    public CustomPackDTO updateCustomPack(Long id, CustomPackDTO customPackDTO) {
        CustomPack existingPack = customPackRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CustomPack not found with id: " + id));

        // Update fields from DTO
        existingPack.setName(customPackDTO.getName());
        existingPack.setDescription(customPackDTO.getDescription());
        existingPack.setMinItems(customPackDTO.getMinItems());
        existingPack.setMaxItems(customPackDTO.getMaxItems());
        existingPack.setPricingType(customPackDTO.getPricingType());
        existingPack.setFixedPrice(customPackDTO.getFixedPrice());
        existingPack.setDiscountRate(customPackDTO.getDiscountRate());

        CustomPack updatedPack = customPackRepository.save(existingPack);
        return customPackMapper.toDTO(updatedPack);
    }
}