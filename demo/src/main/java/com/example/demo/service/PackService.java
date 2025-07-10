package com.example.demo.service;

import com.example.demo.dto.PackItemRequestDTO;
import com.example.demo.dto.PackItemResponseDTO;
import com.example.demo.dto.PackRequestDTO;
import com.example.demo.dto.PackResponseDTO;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.mapper.ProductMapper;
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
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PackService {

    @Autowired
    private PackRepository packRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private S3Service s3Service;

    @Autowired
    private ProductMapper productMapper;

    @Autowired
    private ImageCompositionService imageCompositionService; // Inject the new service

    @Transactional
    public PackResponseDTO createPack(PackRequestDTO packRequestDTO, MultipartFile imageFile) throws IOException {
        Pack pack = new Pack();
        pack.setName(packRequestDTO.getName());
        pack.setDescription(packRequestDTO.getDescription());
        pack.setPrice(packRequestDTO.getPrice());

        List<PackItem> items = new ArrayList<>();
        if (packRequestDTO.getItems() != null) {
            for (PackItemRequestDTO itemDTO : packRequestDTO.getItems()) {
                PackItem packItem = new PackItem();
                Product defaultProduct = productRepository.findById(itemDTO.getDefaultProductId())
                        .orElseThrow(() -> new ResourceNotFoundException("Default Product not found with id: " + itemDTO.getDefaultProductId()));
                packItem.setDefaultProduct(defaultProduct);

                List<Product> variationProducts = new ArrayList<>();
                if (itemDTO.getVariationProductIds() != null) {
                    for (Long variationId : itemDTO.getVariationProductIds()) {
                        Product variationProduct = productRepository.findById(variationId)
                                .orElseThrow(() -> new ResourceNotFoundException("Variation Product not found with id: " + variationId));
                        variationProducts.add(variationProduct);
                    }
                }
                packItem.setVariationProducts(variationProducts);
                packItem.setPack(pack);
                items.add(packItem);
            }
        }
        pack.setItems(items);

        if (imageFile != null && !imageFile.isEmpty()) {
            String imageUrl = s3Service.saveImage(imageFile);
            pack.setImageUrl(imageUrl);
        } else {
            // Generate composite image on creation if no main image is uploaded
            updatePackImage(pack);
        }

        Pack savedPack = packRepository.save(pack);
        return convertToResponseDTO(savedPack);
    }

    /**
     * NEW: Updates a pack item's default product and regenerates the main pack image.
     */
    @Transactional
    public PackResponseDTO updateDefaultProduct(Long packId, Long packItemId, Long newDefaultProductId) throws IOException {
        Pack pack = packRepository.findById(packId)
                .orElseThrow(() -> new ResourceNotFoundException("Pack not found with id: " + packId));

        PackItem itemToUpdate = pack.getItems().stream()
                .filter(item -> item.getId().equals(packItemId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("PackItem not found with id: " + packItemId));

        Product newDefaultProduct = productRepository.findById(newDefaultProductId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + newDefaultProductId));

        itemToUpdate.setDefaultProduct(newDefaultProduct);

        updatePackImage(pack); // Regenerate and save the composite image

        Pack savedPack = packRepository.save(pack);
        return convertToResponseDTO(savedPack);
    }

    /**
     * NEW: Helper method to regenerate and save the composite image.
     */
    private void updatePackImage(Pack pack) throws IOException {
        if (pack.getItems() == null || pack.getItems().isEmpty()) {
            return; // Nothing to compose
        }

        List<String> imageUrls = pack.getItems().stream()
                .map(item -> item.getDefaultProduct().getImages().get(0)) // Assumes product has at least one image
                .collect(Collectors.toList());

        if (imageUrls.isEmpty()) {
            pack.setImageUrl(null);
            return;
        }

        byte[] compositeImageBytes = imageCompositionService.createCompositeImage(imageUrls);

        if (compositeImageBytes.length > 0) {
            String newImageUrl = s3Service.saveImage(compositeImageBytes, "pack-" + pack.getId() + "-composite.png");
            pack.setImageUrl(newImageUrl);
        }
    }


    // The rest of your service methods (getAllPacks, getPackById, converters) remain the same.

    public List<PackResponseDTO> getAllPacks() {
        return packRepository.findAll().stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    public PackResponseDTO getPackById(Long id) {
        Pack pack = packRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pack not found with id: " + id));
        return convertToResponseDTO(pack);
    }

    private PackResponseDTO convertToResponseDTO(Pack pack) {
        PackResponseDTO dto = new PackResponseDTO();
        dto.setId(pack.getId());
        dto.setName(pack.getName());
        dto.setDescription(pack.getDescription());
        dto.setPrice(pack.getPrice());
        dto.setImageUrl(pack.getImageUrl());
        if (pack.getItems() != null) {
            dto.setItems(pack.getItems().stream()
                    .map(this::convertItemToResponseDTO)
                    .collect(Collectors.toList()));
        }
        return dto;
    }

    private PackItemResponseDTO convertItemToResponseDTO(PackItem item) {
        PackItemResponseDTO itemDto = new PackItemResponseDTO();
        itemDto.setId(item.getId());
        if (item.getDefaultProduct() != null) {
            itemDto.setDefaultProduct(productMapper.toDTO(item.getDefaultProduct()));
        }
        if (item.getVariationProducts() != null) {
            itemDto.setVariationProducts(
                    item.getVariationProducts().stream()
                            .map(productMapper::toDTO)
                            .collect(Collectors.toList())
            );
        }
        return itemDto;
    }
}