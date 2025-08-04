package com.example.demo.service;

import com.example.demo.dto.CustomPackDTO;
import com.example.demo.mapper.CustomPackMapper;
import com.example.demo.model.CustomPack;
import com.example.demo.repositories.CustomPackRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

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
}