package com.example.demo.service;

import com.example.demo.dto.PackItemResponseDTO;
import com.example.demo.dto.PackRequestDTO;
import com.example.demo.dto.PackResponseDTO;
import com.example.demo.dto.ProductDTO;
import com.example.demo.model.Pack;
import com.example.demo.model.PackItem;
import com.example.demo.model.Product;
import com.example.demo.repositories.PackRepository;
import com.example.demo.repositories.ProductRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PackService {

    private final PackRepository packRepository;
    private final ProductRepository productRepository;

    public PackService(PackRepository packRepository, ProductRepository productRepository) {
        this.packRepository = packRepository;
        this.productRepository = productRepository;
    }

    @Transactional
    public Pack createPack(PackRequestDTO requestDTO) {
        Pack pack = new Pack();
        pack.setName(requestDTO.getName());
        pack.setDescription(requestDTO.getDescription());
        pack.setPrice(requestDTO.getPrice());

        Pack savedPack = packRepository.save(pack);

        List<PackItem> packItems = requestDTO.getItems().stream().map(itemDTO -> {
            PackItem packItem = new PackItem();

            Product defaultProduct = productRepository.findById(itemDTO.getDefaultProductId())
                    .orElseThrow(() -> new EntityNotFoundException("Default Product not found with id: " + itemDTO.getDefaultProductId()));
            packItem.setDefaultProduct(defaultProduct);

            if (itemDTO.getVariationProductIds() != null && !itemDTO.getVariationProductIds().isEmpty()) {
                List<Product> variations = productRepository.findAllById(itemDTO.getVariationProductIds());
                packItem.setVariationProducts(variations);
            }

            packItem.setPack(savedPack);
            return packItem;
        }).collect(Collectors.toList());

        savedPack.setItems(packItems);

        return packRepository.save(savedPack);
    }

    @Transactional(readOnly = true)
    public List<PackResponseDTO> getAllPacks() {
        return packRepository.findAll().stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PackResponseDTO getPackById(Long id) {
        Pack pack = packRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Pack not found with id: " + id));
        return convertToResponseDTO(pack);
    }

    private PackResponseDTO convertToResponseDTO(Pack pack) {
        PackResponseDTO dto = new PackResponseDTO();
        dto.setId(pack.getId());
        dto.setName(pack.getName());
        dto.setDescription(pack.getDescription());
        dto.setPrice(pack.getPrice());
        dto.setItems(pack.getItems().stream()
                .map(this::convertItemToResponseDTO)
                .collect(Collectors.toList()));
        return dto;
    }

    private PackItemResponseDTO convertItemToResponseDTO(PackItem item) {
        PackItemResponseDTO dto = new PackItemResponseDTO();
        dto.setId(item.getId());
        dto.setDefaultProduct(convertProductToDTO(item.getDefaultProduct()));
        dto.setVariationProducts(item.getVariationProducts().stream()
                .map(this::convertProductToDTO)
                .collect(Collectors.toList()));
        return dto;
    }

    private ProductDTO convertProductToDTO(Product product) {
        ProductDTO dto = new ProductDTO();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setPrice(product.getPrice());
        return dto;
    }
}