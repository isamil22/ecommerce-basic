package com.example.demo.controller;

import com.example.demo.dto.PackRequestDTO;
import com.example.demo.dto.PackResponseDTO;
import com.example.demo.dto.UpdateDefaultProductRequestDTO;
import com.example.demo.mapper.PackMapper;
import com.example.demo.model.Pack;
import com.example.demo.service.PackService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/packs")
@RequiredArgsConstructor
public class PackController {

    private final PackService packService;
    private final PackMapper packMapper;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PackResponseDTO> createPack(@RequestPart("pack") PackRequestDTO packRequestDTO,
                                                      @RequestPart(value = "image", required = false) MultipartFile image) throws IOException {
        PackResponseDTO createdPack = packService.createPack(packRequestDTO, image);
        return new ResponseEntity<>(createdPack, HttpStatus.CREATED);
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PackResponseDTO> updatePack(@PathVariable Long id,
                                                      @RequestPart("pack") PackRequestDTO packRequestDTO,
                                                      @RequestPart(value = "image", required = false) MultipartFile image) throws IOException {
        PackResponseDTO updatedPack = packService.updatePack(id, packRequestDTO, image);
        return ResponseEntity.ok(updatedPack);
    }

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

    @PutMapping("/{packId}/items/{itemId}/default-product")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PackResponseDTO> updateDefaultProduct(
            @PathVariable Long packId,
            @PathVariable Long itemId,
            @RequestBody UpdateDefaultProductRequestDTO request) throws IOException {
        PackResponseDTO updatedPack = packService.updateDefaultProduct(packId, itemId, request.getProductId());
        return ResponseEntity.ok(updatedPack);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deletePack(@PathVariable Long id) {
        packService.deletePack(id);
        return ResponseEntity.noContent().build();
    }
}