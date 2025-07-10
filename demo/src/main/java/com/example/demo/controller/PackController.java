package com.example.demo.controller;

import com.example.demo.dto.PackRequestDTO;
import com.example.demo.dto.PackResponseDTO;
import com.example.demo.dto.UpdateDefaultProductRequestDTO;
import com.example.demo.service.PackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/packs")
@CrossOrigin(origins = "*")
public class PackController {

    @Autowired
    private PackService packService;

    @PostMapping
    public ResponseEntity<PackResponseDTO> createPack(@RequestPart("pack") PackRequestDTO packRequestDTO,
                                                      @RequestPart(value = "image", required = false) MultipartFile imageFile) throws IOException {
        PackResponseDTO createdPack = packService.createPack(packRequestDTO, imageFile);
        return new ResponseEntity<>(createdPack, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<PackResponseDTO>> getAllPacks() {
        return ResponseEntity.ok(packService.getAllPacks());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PackResponseDTO> getPackById(@PathVariable Long id) {
        return ResponseEntity.ok(packService.getPackById(id));
    }

    /**
     * NEW ENDPOINT: Updates the default product for a pack item and regenerates the pack image.
     */
    @PutMapping("/{packId}/items/{itemId}/default-product")
    public ResponseEntity<PackResponseDTO> updateDefaultProduct(
            @PathVariable Long packId,
            @PathVariable Long itemId,
            @RequestBody UpdateDefaultProductRequestDTO request) {
        try {
            PackResponseDTO updatedPack = packService.updateDefaultProduct(packId, itemId, request.getProductId());
            return ResponseEntity.ok(updatedPack);
        } catch (IOException e) {
            // Consider more specific error handling/logging
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}