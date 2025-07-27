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
        Announcement announcement = announcementRepository.findById(1L).orElse(new Announcement());
        return toDto(announcement);
    }

    public AnnouncementDTO updateAnnouncement(AnnouncementDTO dto) {
        Announcement announcement = announcementRepository.findById(1L).orElse(new Announcement());
        announcement.setText(dto.getText());
        announcement.setBackgroundColor(dto.getBackgroundColor());
        announcement.setTextColor(dto.getTextColor());
        announcement.setEnabled(dto.isEnabled());
        Announcement savedAnnouncement = announcementRepository.save(announcement);
        return toDto(savedAnnouncement);
    }

    private AnnouncementDTO toDto(Announcement announcement) {
        AnnouncementDTO dto = new AnnouncementDTO();
        dto.setText(announcement.getText());
        dto.setBackgroundColor(announcement.getBackgroundColor());
        dto.setTextColor(announcement.getTextColor());
        dto.setEnabled(announcement.isEnabled());
        return dto;
    }
}