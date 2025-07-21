package com.example.demo.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * Represents a generic setting in the database, stored as a key-value pair.
 * This will be used to store the Facebook Pixel ID and other future settings.
 */
@Entity
@Table(name = "settings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Setting {

    /**
     * The unique key for the setting (e.g., "facebookPixelId").
     * Renamed from "key" to "settingKey" to avoid SQL reserved keyword conflicts.
     */
    @Id
    @Column(name = "setting_key") // Explicitly name the column in the database
    private String settingKey;

    /**
     * The value of the setting.
     */
    private String value;
}

