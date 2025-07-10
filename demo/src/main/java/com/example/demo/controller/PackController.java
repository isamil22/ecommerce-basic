package com.example.demo.controller;

import com.example.demo.dto.PackResponseDTO;
import com.example.demo.model.Pack;
import com.example.demo.service.PackService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/packs")
public class PackController {

    private final PackService packService;

    public PackController(PackService packService) {
        this.packService = packService;
    }

    @GetMapping
    public ResponseEntity<List<PackResponseDTO>> getAllPacks() {
        // Map the List<Pack> to List<PackResponseDTO>
        List<PackResponseDTO> packs = packService.getAllPacks().stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(packs);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PackResponseDTO> getPackById(@PathVariable Long id) {
        // Map the Optional<Pack> to PackResponseDTO
        Optional<Pack> packOptional = packService.getPackById(id);
        return packOptional.map(pack -> ResponseEntity.ok(convertToDto(pack)))
                .orElse(ResponseEntity.notFound().build());
    }

    // Utility method to convert Pack to PackResponseDTO
    private PackResponseDTO convertToDto(Pack pack) {
        // Assuming PackResponseDTO has a constructor that takes Pack entity
        // or you can set fields manually
        PackResponseDTO dto = new PackResponseDTO();
        dto.setId(pack.getId());
        dto.setName(pack.getName());
        // set other fields as needed
        return dto;
    }
}