package com.example.demo.controller;

import com.example.demo.dto.PackResponseDTO;
import com.example.demo.dto.UpdateDefaultProductRequestDTO; // Import the DTO
import com.example.demo.mapper.PackMapper;
import com.example.demo.model.Pack;
import com.example.demo.service.PackService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize; // Import for security
import org.springframework.web.bind.annotation.*;

import java.io.IOException; // Import IOException
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/packs")
@RequiredArgsConstructor
public class PackController {

    private final PackService packService;
    private final PackMapper packMapper;

    @GetMapping
    public ResponseEntity<List<PackResponseDTO>> getAllPacks() {
        List<PackResponseDTO> packs = packService.getAllPacks().stream()
                .map(packMapper::toResponseDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(packs);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PackResponseDTO> getPackById(@PathVariable Long id) {
        Optional<Pack> packOptional = packService.getPackById(id);
        return packOptional.map(pack -> ResponseEntity.ok(packMapper.toResponseDTO(pack)))
                .orElse(ResponseEntity.notFound().build());
    }

    // FIX: Add the new endpoint to handle default product updates in a pack
    @PutMapping("/{packId}/items/{itemId}/default-product")
    @PreAuthorize("isAuthenticated()") // Secure the endpoint
    public ResponseEntity<PackResponseDTO> updateDefaultProduct(
            @PathVariable Long packId,
            @PathVariable Long itemId,
            @RequestBody UpdateDefaultProductRequestDTO request) throws IOException {
        PackResponseDTO updatedPack = packService.updateDefaultProduct(packId, itemId, request.getProductId());
        return ResponseEntity.ok(updatedPack);
    }
}