package com.example.demo.service;

import com.example.demo.dto.PackRequestDTO;
import com.example.demo.dto.PackResponseDTO;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.mapper.PackMapper;
import com.example.demo.model.Pack;
import com.example.demo.model.PackItem;
import com.example.demo.model.Product;
import com.example.demo.repositories.PackRepository;
import com.example.demo.repositories.ProductRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PackService {

    // ✅ 1. ADD LOGGER
    private static final Logger logger = LoggerFactory.getLogger(PackService.class);

    @Autowired
    private PackRepository packRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ImageCompositionService imageCompositionService;

    @Autowired
    private S3Service s3Service;

    @Autowired
    private PackMapper packMapper;

    public List<Pack> getAllPacks() {
        return packRepository.findAll();
    }

    public Optional<Pack> getPackById(Long id) {
        return packRepository.findById(id);
    }

    @Transactional
    public PackResponseDTO createPack(PackRequestDTO packRequestDTO, MultipartFile imageFile) throws IOException {
        Pack pack = new Pack();
        pack.setName(packRequestDTO.getName());
        pack.setDescription(packRequestDTO.getDescription());
        pack.setPrice(packRequestDTO.getPrice());

        if (imageFile != null && !imageFile.isEmpty()) {
            String imageUrl = s3Service.saveImage(imageFile);
            pack.setImageUrl(imageUrl);
        } else {
            // Generate a composite image if no main image is provided
            updatePackImage(pack);
        }

        List<PackItem> items = packRequestDTO.getItems().stream().map(itemDTO -> {
            PackItem packItem = new PackItem();
            Product defaultProduct = productRepository.findById(itemDTO.getDefaultProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Default product not found"));
            packItem.setDefaultProduct(defaultProduct);

            List<Product> variationProducts = itemDTO.getVariationProductIds().stream()
                    .map(id -> productRepository.findById(id)
                            .orElseThrow(() -> new ResourceNotFoundException("Variation product not found")))
                    .collect(Collectors.toList());
            packItem.setVariationProducts(variationProducts);
            packItem.setPack(pack);
            return packItem;
        }).collect(Collectors.toList());

        pack.setItems(items);
        Pack savedPack = packRepository.save(pack);

        return packMapper.toResponseDTO(savedPack);
    }

    @Transactional
    public Pack updatePack(Long id, Pack packDetails) {
        Pack pack = packRepository.findById(id).orElseThrow(() -> new RuntimeException("Pack not found"));
        pack.setName(packDetails.getName());
        pack.setPrice(packDetails.getPrice());
        pack.setItems(packDetails.getItems());

        updatePackImage(pack);

        return packRepository.save(pack);
    }

    public void deletePack(Long id) {
        packRepository.deleteById(id);
    }

    @Transactional
    public PackResponseDTO updateDefaultProduct(Long packId, Long itemId, Long productId) {
        Pack pack = packRepository.findById(packId)
                .orElseThrow(() -> new ResourceNotFoundException("Pack not found with id: " + packId));

        PackItem itemToUpdate = pack.getItems().stream()
                .filter(item -> item.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("PackItem not found with id: " + itemId));

        Product newDefaultProduct = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        itemToUpdate.setDefaultProduct(newDefaultProduct);

        // This will now handle errors gracefully instead of crashing
        updatePackImage(pack);

        Pack updatedPack = packRepository.save(pack);
        return packMapper.toResponseDTO(updatedPack);
    }

    // ✅ 2. MAKE THE IMAGE UPDATE METHOD MORE DEFENSIVE
    private void updatePackImage(Pack pack) {
        try {
            if (pack.getItems() == null || pack.getItems().isEmpty()) {
                logger.warn("Attempted to update image for a pack with no items. Pack ID: {}", pack.getId());
                return;
            }

            List<String> imageUrls = pack.getItems().stream()
                    .map(item -> {
                        Product product = item.getDefaultProduct();
                        if (product != null && product.getImages() != null && !product.getImages().isEmpty()) {
                            // Ensure the image URL is not null or blank before returning
                            String imageUrl = product.getImages().get(0);
                            if (imageUrl != null && !imageUrl.trim().isEmpty()) {
                                logger.info("Found image URL for product ID {}: {}", product.getId(), imageUrl);
                                return imageUrl;
                            }
                        }
                        logger.warn("No valid image found for default product ID {} in pack ID {}", (product != null ? product.getId() : "null"), pack.getId());
                        return null;
                    })
                    .filter(Objects::nonNull)
                    .collect(Collectors.toList());

            if (imageUrls.isEmpty()) {
                logger.warn("No valid image URLs found to compose for pack ID {}. Image will not be updated.", pack.getId());
                return; // Exit without changing the image
            }

            logger.info("Composing new image for pack ID {} with URLs: {}", pack.getId(), imageUrls);
            byte[] compositeImageBytes = imageCompositionService.createCompositeImage(imageUrls);

            if (compositeImageBytes != null && compositeImageBytes.length > 0) {
                logger.info("Uploading composite image to S3 for pack ID {}.", pack.getId());
                String newImageUrl = s3Service.saveImage(compositeImageBytes, "pack-" + pack.getId() + "-composite.png");
                pack.setImageUrl(newImageUrl);
                logger.info("Successfully updated image URL for pack ID {} to: {}", pack.getId(), newImageUrl);
            } else {
                logger.warn("Composite image byte array was empty for pack ID {}.", pack.getId());
            }
        } catch (Exception e) {
            // Log the full error but do not let it crash the entire request.
            // This prevents the 500 error. The user will see an error in the logs,
            // but the app won't crash for other users.
            logger.error("!!! CRITICAL: Failed to update and compose pack image for pack ID {}. The operation will continue without an image update.", pack.getId(), e);
        }
    }
}