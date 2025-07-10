package com.example.demo.service;

import com.example.demo.dto.PackItemRequestDTO;
import com.example.demo.dto.PackItemResponseDTO;
import com.example.demo.dto.PackRequestDTO;
import com.example.demo.dto.PackResponseDTO;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.model.Pack;
import com.example.demo.model.PackItem;
import com.example.demo.model.Product;
import com.example.demo.repositories.PackRepository;
import com.example.demo.repositories.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

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
    private S3Service s3Service; // S3Service is used for file uploads

    /**
     * UPDATED: This method now accepts a MultipartFile.
     * It uploads the file to your S3 bucket and saves the URL to the pack.
     */
    public PackResponseDTO createPack(PackRequestDTO packRequestDTO, MultipartFile imageFile) {
        Pack pack = new Pack();
        pack.setName(packRequestDTO.getName());
        pack.setDescription(packRequestDTO.getDescription());
        pack.setPrice(packRequestDTO.getPrice());

        // Upload image to S3 and set the URL on the pack entity
        if (imageFile != null && !imageFile.isEmpty()) {
            String imageUrl = s3Service.uploadFile(imageFile);
            pack.setImageUrl(imageUrl);
        }

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

        Pack savedPack = packRepository.save(pack);
        return convertToResponseDTO(savedPack);
    }

    // ... other existing methods (getAllPacks, getPackById, etc.) ...

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
        // You will need a proper mapping for Product to ProductDTO here
        // For now, this structure is sufficient for the pack creation logic.
        return itemDto;
    }
}