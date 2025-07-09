package com.example.demo.dto;

import lombok.Data;

/**
 * This class represents the data transfer object for login requests.
 * It now includes a token for reCAPTCHA validation.
 */
@Data
public class LoginRequest {
    private String email;
    private String password;
    private String recaptchaToken; // Added for reCAPTCHA validation
}