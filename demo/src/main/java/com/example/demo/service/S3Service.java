package com.example.demo.service;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.PutObjectRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.UUID;

@Service
public class S3Service {

    @Autowired
    private AmazonS3 s3client;

    @Value("${aws.s3.bucket}")
    private String bucketName;

    public String saveImage(MultipartFile file) throws IOException {
        String originalFilename = file.getOriginalFilename();
        String key = "images/" + UUID.randomUUID().toString() + "-" + originalFilename;

        ObjectMetadata metadata = new ObjectMetadata();
        metadata.setContentLength(file.getSize());
        metadata.setContentType(file.getContentType());

        s3client.putObject(new PutObjectRequest(bucketName, key, file.getInputStream(), metadata));

        return s3client.getUrl(bucketName, key).toString();
    }

    /**
     * NEW METHOD: Handles uploading a byte array, such as a composite image.
     *
     * @param imageBytes The raw bytes of the image to upload.
     * @param fileName The desired file name for the object in the S3 bucket.
     * @return The public URL of the uploaded image.
     * @throws IOException If the input stream from the byte array cannot be read.
     */
    public String saveImage(byte[] imageBytes, String fileName) throws IOException {
        String key = "images/" + UUID.randomUUID().toString() + "-" + fileName;

        ObjectMetadata metadata = new ObjectMetadata();
        metadata.setContentLength(imageBytes.length);
        metadata.setContentType("image/png"); // Composite image is always PNG

        try (InputStream inputStream = new ByteArrayInputStream(imageBytes)) {
            s3client.putObject(new PutObjectRequest(bucketName, key, inputStream, metadata));
        }

        return s3client.getUrl(bucketName, key).toString();
    }
}