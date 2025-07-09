// src/main/java/com/example/demo/dto/RegistrationRequest.java
package com.example.demo.dto;

import lombok.Data;

@Data
public class RegistrationRequest {
    private String fullName;
    private String email;
    private String password;
    private String recaptchaToken;
}