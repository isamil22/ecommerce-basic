package com.example.demo.dto;

import com.example.demo.model.User;
import lombok.Data;

@Data
public class UserDTO {
    private Long id;
    private String email;
    private String fullName; // ADDED
    private User.Role role;
    private boolean emailConfirmation;
}