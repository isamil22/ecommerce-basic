package com.example.demo.controller;

import com.example.demo.dto.AnnouncementDTO;
import com.example.demo.service.AnnouncementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/announcement")
@RequiredArgsConstructor
public class AnnouncementController {

    private final AnnouncementService announcementService;

    @GetMapping
    public ResponseEntity<AnnouncementDTO> getAnnouncement() {
        return ResponseEntity.ok(announcementService.getAnnouncement());
    }

    @PutMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AnnouncementDTO> updateAnnouncement(@RequestBody AnnouncementDTO announcementDTO) {
        return ResponseEntity.ok(announcementService.updateAnnouncement(announcementDTO));
    }
}