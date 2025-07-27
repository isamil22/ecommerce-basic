package com.example.demo.controller;

import com.example.demo.model.VisitorCountSetting;
import com.example.demo.service.VisitorCountSettingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/visitor-counter-settings")
public class VisitorCountSettingController {

    @Autowired
    private VisitorCountSettingService service;

    @GetMapping
    public ResponseEntity<VisitorCountSetting> getSettings() {
        VisitorCountSetting settings = service.getSettings();
        return ResponseEntity.ok(settings);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<VisitorCountSetting> updateSettings(@RequestBody VisitorCountSetting newSettings) {
        VisitorCountSetting updatedSettings = service.updateSettings(newSettings);
        return ResponseEntity.ok(updatedSettings);
    }
}