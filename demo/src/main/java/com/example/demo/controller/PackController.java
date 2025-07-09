package com.example.demo.controller;


import com.example.demo.dto.PackRequestDTO;
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

    /**
     * Endpoint for admins to create a new product pack.
     * Example: Create a "Summer Glow Kit" containing a default sunscreen
     * and a default lip balm, with other products as possible variations.
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Pack> createPack(@RequestBody PackRequestDTO requestDTO) {
        Pack createdPack = packService.createPack(requestDTO);
        return new ResponseEntity<>(createdPack, HttpStatus.CREATED);
    }

    /**
     * Endpoint to get all available packs.
     * This can be used to display packs on the main shop page.
     */
    @GetMapping
    public ResponseEntity<List<Pack>> getAllPacks() {
        List<Pack> packs = packService.getAllPacks();
        return ResponseEntity.ok(packs);
    }

    /**
     * Endpoint to get a single pack by its ID, including all its items.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Pack> getPackById(@PathVariable Long id) {
        Pack pack = packService.getPackById(id);
        return ResponseEntity.ok(pack);
    }
}