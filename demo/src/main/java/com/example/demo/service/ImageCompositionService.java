package com.example.demo.service;

import org.springframework.stereotype.Service;
import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;
import java.awt.Graphics2D;

@Service
public class ImageCompositionService {

    /**
     * Creates a composite image by stitching together multiple images from URLs horizontally.
     * @param imageUrls A list of public URLs for the images to combine.
     * @return A byte array representing the final composite PNG image.
     * @throws IOException If an image cannot be read from a URL.
     */
    public byte[] createCompositeImage(List<String> imageUrls) throws IOException {
        if (imageUrls == null || imageUrls.isEmpty()) {
            return new byte[0];
        }

        List<BufferedImage> images = new ArrayList<>();
        for (String url : imageUrls) {
            if (url != null && !url.trim().isEmpty()) {
                images.add(ImageIO.read(new URL(url)));
            }
        }

        if (images.isEmpty()) {
            return new byte[0];
        }

        // Use dimensions of the first image as the standard for height
        int standardHeight = images.get(0).getHeight();
        int totalWidth = 0;

        // Calculate total width based on scaled images
        for (BufferedImage img : images) {
            double scale = (double) standardHeight / img.getHeight();
            totalWidth += (int) (img.getWidth() * scale);
        }

        BufferedImage compositeImage = new BufferedImage(totalWidth, standardHeight, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g2d = compositeImage.createGraphics();

        int currentX = 0;
        for (BufferedImage image : images) {
            double scale = (double) standardHeight / image.getHeight();
            int scaledWidth = (int) (image.getWidth() * scale);
            g2d.drawImage(image, currentX, 0, scaledWidth, standardHeight, null);
            currentX += scaledWidth;
        }
        g2d.dispose();

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            ImageIO.write(compositeImage, "png", baos);
            return baos.toByteArray();
        }
    }
}