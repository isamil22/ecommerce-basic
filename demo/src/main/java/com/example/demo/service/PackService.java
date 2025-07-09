package com.example.demo.service;


import com.example.demo.dto.PackRequestDTO;
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

        List<PackItem> packItems = requestDTO.getItems().stream().map(itemDTO -> {
            PackItem packItem = new PackItem();

            // Set the default product
            Product defaultProduct = productRepository.findById(itemDTO.getDefaultProductId())
                    .orElseThrow(() -> new EntityNotFoundException("Default Product not found with id: " + itemDTO.getDefaultProductId()));
            packItem.setDefaultProduct(defaultProduct);

            // Set the variation products
            if (itemDTO.getVariationProductIds() != null && !itemDTO.getVariationProductIds().isEmpty()) {
                List<Product> variations = productRepository.findAllById(itemDTO.getVariationProductIds());
                packItem.setVariationProducts(variations);
            }

            packItem.setPack(pack); // Link back to the parent pack
            return packItem;
        }).collect(Collectors.toList());

        pack.setItems(packItems);

        return packRepository.save(pack);
    }

    public List<Pack> getAllPacks() {
        return packRepository.findAll();
    }

    public Pack getPackById(Long id) {
        return packRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Pack not found with id: " + id));
    }
}