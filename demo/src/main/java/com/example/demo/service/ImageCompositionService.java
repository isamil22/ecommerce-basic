package com.example.demo.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ImageCompositionService {

    private static final Logger logger = LoggerFactory.getLogger(ImageCompositionService.class);

    public byte[] createCompositeImage(List<String> imageUrls) throws IOException {
        // 1. Filter out any null or blank URLs first.
        List<String> validImageUrls = imageUrls.stream()
                .filter(url -> url != null && !url.trim().isEmpty())
                .collect(Collectors.toList());

        if (validImageUrls.isEmpty()) {
            logger.warn("No valid image URLs provided to create a composite image.");
            return new byte[0];
        }

        List<BufferedImage> images = new ArrayList<>();
        // 2. Safely read images and log errors for any that fail.
        for (String urlString : validImageUrls) {
            try {
                URL url = new URL(urlString);
                BufferedImage image = ImageIO.read(url);
                if (image != null) {
                    images.add(image);
                } else {
                    // This is key: log the specific URL that failed.
                    logger.error("Failed to read image from URL (it was null): {}", urlString);
                }
            } catch (IOException e) {
                logger.error("IOException while reading image from URL: {}", urlString, e);
            }
        }

        // 3. Ensure we have images to process before continuing.
        if (images.isEmpty()) {
            logger.error("Could not load any images from the provided URLs. Cannot create composite image.");
            return new byte[0];
        }

        // Calculate dimensions for the composite image
        int totalWidth = 0;
        int maxHeight = 0;
        for (BufferedImage img : images) {
            totalWidth += img.getWidth();
            if (img.getHeight() > maxHeight) {
                maxHeight = img.getHeight();
            }
        }

        // Create the composite image canvas
        BufferedImage compositeImage = new BufferedImage(totalWidth, maxHeight, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g2d = compositeImage.createGraphics();

        // Draw each image onto the canvas
        int currentX = 0;
        for (BufferedImage img : images) {
            g2d.drawImage(img, currentX, 0, null);
            currentX += img.getWidth();
        }
        g2d.dispose();

        // Convert the final image to a byte array
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            ImageIO.write(compositeImage, "PNG", baos);
            return baos.toByteArray();
        }
    }
}