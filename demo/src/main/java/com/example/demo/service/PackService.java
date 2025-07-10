package com.example.demo.service;

import com.example.demo.model.Pack;
import com.example.demo.model.PackItem;
import com.example.demo.model.Product;
import com.example.demo.repositories.PackRepository;
import com.example.demo.repositories.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PackService {

    @Autowired
    private PackRepository packRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ImageCompositionService imageCompositionService;

    @Autowired
    private S3Service s3Service;

    public List<Pack> getAllPacks() {
        return packRepository.findAll();
    }

    public Optional<Pack> getPackById(Long id) {
        return packRepository.findById(id);
    }

    @Transactional
    public Pack createPack(Pack pack) {
        return packRepository.save(pack);
    }

    @Transactional
    public Pack updatePack(Long id, Pack packDetails) {
        Pack pack = packRepository.findById(id).orElseThrow(() -> new RuntimeException("Pack not found"));
        pack.setName(packDetails.getName());
        pack.setPrice(packDetails.getPrice());
        pack.setItems(packDetails.getItems());
        return packRepository.save(pack);
    }

    public void deletePack(Long id) {
        packRepository.deleteById(id);
    }

    @Transactional
    public Pack updateDefaultProduct(Long packId, Long itemId, Long productId) throws IOException {
        Pack pack = packRepository.findById(packId).orElseThrow(() -> new RuntimeException("Pack not found"));
        Product product = productRepository.findById(productId).orElseThrow(() -> new RuntimeException("Product not found"));

        PackItem itemToUpdate = pack.getItems().stream()
                .filter(item -> item.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Item not found in pack"));

        itemToUpdate.setDefaultProduct(product);
        updatePackImage(pack);
        return packRepository.save(pack);
    }

    private void updatePackImage(Pack pack) throws IOException {
        if (pack.getItems() == null || pack.getItems().isEmpty()) {
            return; // Nothing to compose
        }

        // Safely get image URLs, filtering out products without images
        List<String> imageUrls = pack.getItems().stream()
                .map(item -> {
                    Product product = item.getDefaultProduct();
                    // Check if the product and its image list are valid
                    if (product != null && product.getImages() != null && !product.getImages().isEmpty()) {
                        return product.getImages().get(0);
                    }
                    return null; // Return null if no valid image is found
                })
                .filter(Objects::nonNull) // Remove any nulls from the stream
                .collect(Collectors.toList());

        if (imageUrls.isEmpty()) {
            pack.setImageUrl(null); // Set to null or a default placeholder if no images are available
            return;
        }

        byte[] compositeImageBytes = imageCompositionService.createCompositeImage(imageUrls);

        if (compositeImageBytes != null && compositeImageBytes.length > 0) {
            String newImageUrl = s3Service.saveImage(compositeImageBytes, "pack-" + pack.getId() + "-composite.png");
            pack.setImageUrl(newImageUrl);
        }
    }
}