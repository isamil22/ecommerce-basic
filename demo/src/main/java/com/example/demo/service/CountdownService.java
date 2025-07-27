package com.example.demo.service;

import com.example.demo.dto.CountdownDTO;
import com.example.demo.mapper.CountdownMapper;
import com.example.demo.model.Countdown;
import com.example.demo.repositories.CountdownRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CountdownService {

    @Autowired
    private CountdownRepository countdownRepository;

    @Autowired
    private CountdownMapper countdownMapper;

    public CountdownDTO getCountdown() {
        Optional<Countdown> countdown = countdownRepository.findAll().stream().findFirst();
        return countdown.map(countdownMapper::toDto).orElse(null);
    }

    public CountdownDTO saveCountdown(CountdownDTO countdownDTO) {
        List<Countdown> countdowns = countdownRepository.findAll();
        Countdown countdown;
        if (countdowns.isEmpty()) {
            countdown = new Countdown();
        } else {
            countdown = countdowns.get(0);
        }
        countdown.setTitle(countdownDTO.getTitle());
        countdown.setEndDate(countdownDTO.getEndDate());
        countdown.setEnabled(countdownDTO.isEnabled());
        countdown.setBackgroundColor(countdownDTO.getBackgroundColor());
        countdown.setTextColor(countdownDTO.getTextColor());
        Countdown savedCountdown = countdownRepository.save(countdown);
        return countdownMapper.toDto(savedCountdown);
    }
}