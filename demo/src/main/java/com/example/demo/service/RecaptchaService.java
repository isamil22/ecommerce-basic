package com.example.demo.service;

import com.example.demo.dto.RecaptchaResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

/**
 * This service handles the communication with Google's reCAPTCHA API for token verification.
 */
@Service
public class RecaptchaService {
    private static final String RECAPTCHA_VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";
    private static final Logger logger = LoggerFactory.getLogger(RecaptchaService.class);
    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${recaptcha.secret}")
    private String recaptchaSecret;

    public boolean validateRecaptcha(String token) {
        if (token == null || token.isEmpty()) {
            return false;
        }

        MultiValueMap<String, String> requestMap = new LinkedMultiValueMap<>();
        requestMap.add("secret", recaptchaSecret);
        requestMap.add("response", token);

        try {
            RecaptchaResponse response = restTemplate.postForObject(RECAPTCHA_VERIFY_URL, requestMap, RecaptchaResponse.class);
            if (response != null && response.isSuccess()) {
                return true;
            } else {
                logger.error("reCAPTCHA validation failed. Response: {}", response);
                return false;
            }
        } catch (Exception e) {
            logger.error("Exception occurred while validating reCAPTCHA token", e);
            return false;
        }
    }
}