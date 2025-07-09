package com.example.demo.controller;


import com.example.demo.dto.PackRequestDTO;
import com.example.demo.dto.PackResponseDTO;
import com.example.demo.model.Pack;
import com.example.demo.service.PackService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/packs")
public class PackController {

    private final PackService packService;

    public PackController(PackService packService) {
        this.packService = packService;
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Pack> createPack(@RequestBody PackRequestDTO requestDTO) {
        Pack createdPack = packService.createPack(requestDTO);
        return new ResponseEntity<>(createdPack, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<PackResponseDTO>> getAllPacks() {
        List<PackResponseDTO> packs = packService.getAllPacks();
        return ResponseEntity.ok(packs);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PackResponseDTO> getPackById(@PathVariable Long id) {
        PackResponseDTO pack = packService.getPackById(id);
        return ResponseEntity.ok(pack);
    }
}