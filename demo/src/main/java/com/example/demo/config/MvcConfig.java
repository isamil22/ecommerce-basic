package com.example.demo.config;

import org.springframework.beans.factory.annotation.Value; // <-- Add this import
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class MvcConfig implements WebMvcConfigurer {

    // Inject the path from application.properties
    @Value("${file.upload-dir}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/images/**")
                // Use the absolute path and append /images/ to it
                .addResourceLocations("file:" + uploadDir + "/images/");
    }
}