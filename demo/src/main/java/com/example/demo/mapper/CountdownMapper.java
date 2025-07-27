package com.example.demo.mapper;

import com.example.demo.dto.CountdownDTO;
import com.example.demo.model.Countdown;
import org.springframework.stereotype.Component;

@Component
public class CountdownMapper {

    public CountdownDTO toDto(Countdown countdown) {
        if (countdown == null) {
            return null;
        }
        CountdownDTO dto = new CountdownDTO();
        dto.setTitle(countdown.getTitle());
        dto.setEndDate(countdown.getEndDate());
        dto.setEnabled(countdown.isEnabled());
        dto.setBackgroundColor(countdown.getBackgroundColor());
        dto.setTextColor(countdown.getTextColor());
        return dto;
    }

    public Countdown toEntity(CountdownDTO dto) {
        if (dto == null) {
            return null;
        }
        Countdown countdown = new Countdown();
        countdown.setTitle(dto.getTitle());
        countdown.setEndDate(dto.getEndDate());
        countdown.setEnabled(dto.isEnabled());
        countdown.setBackgroundColor(dto.getBackgroundColor());
        countdown.setTextColor(dto.getTextColor());
        return countdown;
    }
}