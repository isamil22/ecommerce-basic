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

        if (pack.getImageUrl() == null) {
            updatePackImage(pack);
        }

        Pack savedPack = packRepository.save(pack);

        return packMapper.toResponseDTO(savedPack);
    }

    @Transactional
    public PackResponseDTO updatePack(Long id, PackRequestDTO packRequestDTO, MultipartFile imageFile) throws IOException {
        Pack pack = packRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pack not found with id: " + id));

        pack.setName(packRequestDTO.getName());
        pack.setDescription(packRequestDTO.getDescription());
        pack.setPrice(packRequestDTO.getPrice());

        if (imageFile != null && !imageFile.isEmpty()) {
            String newImageUrl = s3Service.saveImage(imageFile);
            pack.setImageUrl(newImageUrl);
        }

        pack.getItems().clear();
        List<PackItem> newItems = packRequestDTO.getItems().stream().map(itemDTO -> {
            PackItem packItem = new PackItem();
            Product defaultProduct = productRepository.findById(itemDTO.getDefaultProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Default product not found with id: " + itemDTO.getDefaultProductId()));
            packItem.setDefaultProduct(defaultProduct);

            List<Product> variationProducts = itemDTO.getVariationProductIds().stream()
                    .map(varId -> productRepository.findById(varId)
                            .orElseThrow(() -> new ResourceNotFoundException("Variation product not found with id: " + varId)))
                    .collect(Collectors.toList());
            packItem.setVariationProducts(variationProducts);
            packItem.setPack(pack);
            return packItem;
        }).collect(Collectors.toList());
        pack.getItems().addAll(newItems);

        if (pack.getImageUrl() == null || (imageFile == null || imageFile.isEmpty())) {
            updatePackImage(pack);
        }

        Pack updatedPack = packRepository.save(pack);
        return packMapper.toResponseDTO(updatedPack);
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

        // Temporarily set the new default product to generate the image
        itemToUpdate.setDefaultProduct(newDefaultProduct);

        // Generate the new composite image based on the temporary selection
        updatePackImage(pack);

        // IMPORTANT: DO NOT SAVE THE PACK ENTITY
        // We return the DTO with the new image URL, but the original default product in the database remains unchanged.
        return packMapper.toResponseDTO(pack);
    }

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
                return;
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
            logger.error("!!! CRITICAL: Failed to update and compose pack image for pack ID {}. The operation will continue without an image update.", pack.getId(), e);
        }
    }
}