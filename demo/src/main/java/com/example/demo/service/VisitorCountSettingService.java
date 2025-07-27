package com.example.demo.service;

import com.example.demo.model.VisitorCountSetting;
import com.example.demo.repositories.VisitorCountSettingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class VisitorCountSettingService {

    @Autowired
    private VisitorCountSettingRepository repository;

    private static final Long SETTINGS_ID = 1L;

    /**
     * Retrieves the visitor count settings. If they don't exist,
     * it creates and saves a default set of settings.
     * @return The current VisitorCountSetting.
     */
    public VisitorCountSetting getSettings() {
        return repository.findById(SETTINGS_ID).orElseGet(() -> {
            VisitorCountSetting defaultSettings = new VisitorCountSetting();
            defaultSettings.setId(SETTINGS_ID);
            defaultSettings.setEnabled(false);
            defaultSettings.setMin(10);
            defaultSettings.setMax(50);
            return repository.save(defaultSettings);
        });
    }

    /**
     * Updates the visitor count settings.
     * @param newSettings The new settings data from the controller.
     * @return The updated VisitorCountSetting.
     */
    public VisitorCountSetting updateSettings(VisitorCountSetting newSettings) {
        VisitorCountSetting settings = repository.findById(SETTINGS_ID)
                .orElse(new VisitorCountSetting());

        settings.setId(SETTINGS_ID);
        settings.setEnabled(newSettings.isEnabled());
        settings.setMin(newSettings.getMin());
        settings.setMax(newSettings.getMax());

        return repository.save(settings);
    }
}