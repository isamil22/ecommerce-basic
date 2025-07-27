package com.example.demo.service;

import com.example.demo.dto.AnnouncementDTO;
import com.example.demo.model.Announcement;
import com.example.demo.repositories.AnnouncementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AnnouncementService {

    private final AnnouncementRepository announcementRepository;

    public AnnouncementDTO getAnnouncement() {
        // Find by ID, or create a new default instance if not found.
        Announcement announcement = announcementRepository.findById(1L).orElseGet(() -> {
            Announcement defaultAnnouncement = new Announcement();
            defaultAnnouncement.setId(1L);
            defaultAnnouncement.setEnabled(false);
            defaultAnnouncement.setText("");
            defaultAnnouncement.setBackgroundColor("#ef4444");
            defaultAnnouncement.setTextColor("#ffffff");
            defaultAnnouncement.setAnimationType("none");
            return defaultAnnouncement;
        });
        return toDto(announcement);
    }

    public AnnouncementDTO updateAnnouncement(AnnouncementDTO dto) {
        Announcement announcement = announcementRepository.findById(1L).orElse(new Announcement());
        announcement.setId(1L); // Ensure ID is set for new announcements
        announcement.setText(dto.getText());
        announcement.setBackgroundColor(dto.getBackgroundColor());
        announcement.setTextColor(dto.getTextColor());
        announcement.setEnabled(dto.isEnabled());
        announcement.setAnimationType(dto.getAnimationType()); // Update animation type
        Announcement savedAnnouncement = announcementRepository.save(announcement);
        return toDto(savedAnnouncement);
    }

    private AnnouncementDTO toDto(Announcement announcement) {
        AnnouncementDTO dto = new AnnouncementDTO();
        dto.setText(announcement.getText());
        dto.setBackgroundColor(announcement.getBackgroundColor());
        dto.setTextColor(announcement.getTextColor());
        dto.setEnabled(announcement.isEnabled());
        dto.setAnimationType(announcement.getAnimationType()); // Map animation type
        return dto;
    }
}
