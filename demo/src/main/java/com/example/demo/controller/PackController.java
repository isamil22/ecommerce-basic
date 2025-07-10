package com.example.demo.controller;

import com.example.demo.dto.PackRequestDTO;
import com.example.demo.dto.PackResponseDTO;
import com.example.demo.service.PackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException; // 1. Add this import
import java.util.List;

@RestController
@RequestMapping("/api/packs")
@CrossOrigin(origins = "*")
public class PackController {

    @Autowired
    private PackService packService;

    @PostMapping(consumes = { "multipart/form-data" })
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PackResponseDTO> createPack(
            @RequestPart("pack") PackRequestDTO packRequestDTO,
            @RequestPart(value = "image", required = false) MultipartFile imageFile) throws IOException { // 2. Add 'throws IOException'
        PackResponseDTO createdPack = packService.createPack(packRequestDTO, imageFile);
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