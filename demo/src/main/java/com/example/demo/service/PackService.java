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
        Pack savedPack = packRepository.save(pack);
        return packMapper.toResponseDTO(savedPack);
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
    public PackResponseDTO updateDefaultProduct(Long packId, Long itemId, Long productId) throws IOException {
        Pack pack = packRepository.findById(packId)
                .orElseThrow(() -> new ResourceNotFoundException("Pack not found with id: " + packId));

        PackItem itemToUpdate = pack.getItems().stream()
                .filter(item -> item.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("PackItem not found with id: " + itemId));

        Product newDefaultProduct = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        itemToUpdate.setDefaultProduct(newDefaultProduct);

        // FIX: This line causes the error and should be removed.
        // updatePackImage(pack);

        Pack updatedPack = packRepository.save(pack);
        return packMapper.toResponseDTO(updatedPack);
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