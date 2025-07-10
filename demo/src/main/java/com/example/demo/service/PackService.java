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

    public PackResponseDTO createPack(PackRequestDTO packRequestDTO, MultipartFile imageFile) throws IOException {
        Pack pack = new Pack();
        pack.setName(packRequestDTO.getName());
        pack.setDescription(packRequestDTO.getDescription());
        pack.setPrice(packRequestDTO.getPrice());

        if (imageFile != null && !imageFile.isEmpty()) {
            // CORRECTED: Changed from uploadFile to saveImage to match S3Service
            String imageUrl = s3Service.saveImage(imageFile);
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