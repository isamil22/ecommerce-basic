package com.example.demo.repositories;

import com.example.demo.model.Setting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

/**
 * Spring Data JPA repository for Setting entities.
 * Provides standard CRUD operations and a custom method to find a setting by its key.
 */
@Repository
public interface SettingRepository extends JpaRepository<Setting, String> {

    /**
     * Finds a setting by its unique key.
     * @param key The key of the setting to find.
     * @return An Optional containing the setting if found, or empty otherwise.
     */
    Optional<Setting> findByKey(String key);
}
