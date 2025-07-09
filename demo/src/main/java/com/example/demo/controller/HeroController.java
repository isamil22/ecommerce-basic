package com.example.demo.controller;

import com.example.demo.dto.HeroDTO;
import com.example.demo.service.HeroService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/hero")
@RequiredArgsConstructor
public class HeroController {

    private final HeroService heroService;

    @GetMapping
    public ResponseEntity<HeroDTO> getHero() {
        return ResponseEntity.ok(heroService.getHero());
    }

    @PutMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<HeroDTO> updateHero(@RequestPart("hero") @Valid HeroDTO heroDTO,
                                              @RequestPart(value = "image", required = false) MultipartFile image) throws IOException {
        return ResponseEntity.ok(heroService.updateHero(heroDTO, image));
    }
}