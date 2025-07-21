package com.example.demo.controller;

import com.example.demo.model.Setting;
import com.example.demo.repositories.SettingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * REST controller for managing application settings.
 */
@RestController
@RequestMapping("/api/settings")
public class SettingsController {

    @Autowired
    private SettingRepository settingRepository;

    /**
     * Retrieves all settings as a map of key-value pairs.
     * This endpoint is public to allow the frontend to fetch the Pixel ID.
     * @return A map of all settings.
     */
    @GetMapping
    public ResponseEntity<Map<String, String>> getSettings() {
        List<Setting> settings = settingRepository.findAll();
        Map<String, String> settingsMap = settings.stream()
                .collect(Collectors.toMap(Setting::getSettingKey, Setting::getValue));
        return ResponseEntity.ok(settingsMap);
    }

    /**
     * Saves or updates settings. This endpoint is restricted to ADMIN users.
     * @param settings A map of settings to save.
     * @return A success message.
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> saveSettings(@RequestBody Map<String, String> settings) {
        settings.forEach((key, value) -> {
            Setting setting = settingRepository.findBySettingKey(key)
                    .orElse(new Setting()); // Create new setting if it doesn't exist
            setting.setSettingKey(key);
            setting.setValue(value);
            settingRepository.save(setting);
        });
        return ResponseEntity.ok().body(Map.of("message", "Settings saved successfully"));
    }
}
