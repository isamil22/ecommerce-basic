package com.example.demo.controller;

import com.example.demo.dto.CustomPackDTO;
import com.example.demo.service.CustomPackService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/custom-packs")
@RequiredArgsConstructor
public class CustomPackController {

    private final CustomPackService customPackService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CustomPackDTO> createCustomPack(@RequestBody CustomPackDTO customPackDTO) {
        return ResponseEntity.ok(customPackService.createCustomPack(customPackDTO));
    }

    @GetMapping
    public ResponseEntity<List<CustomPackDTO>> getAllCustomPacks() {
        return ResponseEntity.ok(customPackService.getAllCustomPacks());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CustomPackDTO> getCustomPackById(@PathVariable Long id) {
        return ResponseEntity.ok(customPackService.getCustomPackById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CustomPackDTO> updateCustomPack(@PathVariable Long id, @RequestBody CustomPackDTO customPackDTO) {
        return ResponseEntity.ok(customPackService.updateCustomPack(id, customPackDTO));
    }

    // --- ADD THIS ENDPOINT ---
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCustomPack(@PathVariable Long id) {
        customPackService.deleteCustomPack(id);
        return ResponseEntity.noContent().build();
    }
}