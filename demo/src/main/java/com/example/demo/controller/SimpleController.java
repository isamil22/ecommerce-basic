package com.example.demo.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping; // <-- IMPORT THIS
import org.springframework.web.bind.annotation.RequestBody; // <-- IMPORT THIS
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;
import java.util.HashMap;

@RestController
public class SimpleController {

    @GetMapping("/api/hello")
    public Map<String, String> sayHello() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Hello! This message is from your Spring Boot backend.");
        return response;
    }

    // --- ADD THIS NEW METHOD ---
    @PostMapping("/api/test-post")
    public Map<String, Object> testPost(@RequestBody(required = false) Map<String, String> payload) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "POST request received successfully!");
        response.put("received_payload", payload);
        return response;
    }
}
