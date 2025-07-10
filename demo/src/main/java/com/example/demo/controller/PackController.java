package com.example.demo.controller;

import com.example.demo.dto.PackResponseDTO;
import com.example.demo.mapper.PackMapper;
import com.example.demo.model.Pack;
import com.example.demo.service.PackService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/packs")
@RequiredArgsConstructor
public class PackController {

    private final PackService packService;
    private final PackMapper packMapper; // Inject the mapper

    @GetMapping
    public ResponseEntity<List<PackResponseDTO>> getAllPacks() {
        List<PackResponseDTO> packs = packService.getAllPacks().stream()
                .map(packMapper::toResponseDTO) // Use the mapper for conversion
                .collect(Collectors.toList());
        return ResponseEntity.ok(packs);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PackResponseDTO> getPackById(@PathVariable Long id) {
        Optional<Pack> packOptional = packService.getPackById(id);
        // Use the mapper to convert the pack to a DTO
        return packOptional.map(pack -> ResponseEntity.ok(packMapper.toResponseDTO(pack)))
                .orElse(ResponseEntity.notFound().build());
    }
}

