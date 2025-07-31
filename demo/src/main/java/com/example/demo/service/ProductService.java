// demo/src/main/java/com/example/demo/service/ProductService.java
package com.example.demo.service;

import com.example.demo.dto.ProductDTO;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.mapper.ProductMapper;
import com.example.demo.model.*;
import com.example.demo.repositories.CategoryRepository;
import com.example.demo.repositories.ProductRepository;
import com.example.demo.specification.ProductSpecification;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private S3Service s3Service;

    @Autowired
    private ProductMapper productMapper;

    @Autowired
    private ProductSpecification productSpecification;

    @Transactional
    public ProductDTO createProductWithImages(ProductDTO productDTO, List<MultipartFile> images) throws IOException {
        Product product = productMapper.toEntity(productDTO);

        Category category = categoryRepository.findById(productDTO.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + productDTO.getCategoryId()));
        product.setCategory(category);
        product.setType(productDTO.getType());

        if (images != null && !images.isEmpty()) {
            List<String> imageUrls = uploadAndGetImageUrls(images);
            product.setImages(imageUrls);
        } else {
            product.setImages(new ArrayList<>());
        }

        // --- MODIFICATION START ---
        // Delegate variant processing to the new helper method.
        updateVariantsForProduct(product, productDTO);
        // --- MODIFICATION END ---

        Product savedProduct = productRepository.save(product);
        return productMapper.toDTO(savedProduct);
    }

    @Transactional
    public ProductDTO updateProductWithImages(Long id, ProductDTO productDTO, List<MultipartFile> images) throws IOException {
        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        // Use the mapper to update basic fields from the DTO.
        productMapper.updateProductFromDto(productDTO, existingProduct);

        if (!existingProduct.getCategory().getId().equals(productDTO.getCategoryId())) {
            Category category = categoryRepository.findById(productDTO.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + productDTO.getCategoryId()));
            existingProduct.setCategory(category);
        }

        if (images != null && !images.isEmpty()) {
            List<String> imageUrls = uploadAndGetImageUrls(images);
            existingProduct.getImages().clear();
            existingProduct.getImages().addAll(imageUrls);
        }

        // --- MODIFICATION START ---
        // Reuse the helper method for updates to ensure consistency.
        updateVariantsForProduct(existingProduct, productDTO);
        // --- MODIFICATION END ---

        Product updatedProduct = productRepository.save(existingProduct);
        return productMapper.toDTO(updatedProduct);
    }

    // --- NEW HELPER METHOD ---
    private void updateVariantsForProduct(Product product, ProductDTO productDTO) {
        // Clear existing variant data to prevent duplicates and ensure a clean update.
        product.getVariantTypes().clear();
        if (productDTO.getVariantTypes() != null) {
            productDTO.getVariantTypes().forEach(vtDto -> {
                VariantType variantType = new VariantType();
                variantType.setName(vtDto.getName());
                variantType.setProduct(product);

                List<VariantOption> options = new ArrayList<>();
                if (vtDto.getOptions() != null) {
                    vtDto.getOptions().forEach(optionValue -> {
                        VariantOption option = new VariantOption();
                        option.setValue(optionValue);
                        option.setVariantType(variantType);
                        options.add(option);
                    });
                }
                variantType.setOptions(options);
                product.getVariantTypes().add(variantType);
            });
        }

        product.getVariants().clear();
        if (productDTO.getVariants() != null) {
            productDTO.getVariants().forEach(pvDto -> {
                ProductVariant productVariant = new ProductVariant();
                productVariant.setProduct(product);
                productVariant.setVariantMap(pvDto.getVariantMap());
                productVariant.setPrice(pvDto.getPrice());
                productVariant.setStock(pvDto.getStock());
                productVariant.setImageUrl(pvDto.getImageUrl());
                product.getVariants().add(productVariant);
            });
        }
    }

    public String uploadAndGetImageUrl(MultipartFile image) throws IOException {
        return s3Service.saveImage(image);
    }

    private List<String> uploadAndGetImageUrls(List<MultipartFile> images) {
        return images.stream()
                .map(image -> {
                    try {
                        return s3Service.saveImage(image);
                    } catch (IOException e) {
                        throw new RuntimeException("Failed to upload image", e);
                    }
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<ProductDTO> getAllProducts(String search, Long categoryId, BigDecimal minPrice, BigDecimal maxPrice, String brand, Boolean bestseller, Boolean newArrival, String type, Pageable pageable) {
        Specification<Product> spec = productSpecification.getProducts(search, minPrice, maxPrice, brand, bestseller, newArrival, categoryId, type);
        return productRepository.findAll(spec, pageable)
                .map(productMapper::toDTO);
    }

    @Transactional(readOnly = true)
    public List<String> getProductSuggestions(String query) {
        List<Product> products = productRepository.findByNameContainingIgnoreCase(query);
        return products.stream()
                .map(Product::getName)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductDTO> getBestsellers() {
        return productRepository.findByBestsellerIsTrue(Pageable.unpaged()).getContent().stream()
                .map(productMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductDTO> getNewArrivals() {
        return productRepository.findByNewArrivalIsTrue(Pageable.unpaged()).getContent().stream()
                .map(productMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProductDTO getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        return productMapper.toDTO(product);
    }

    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new ResourceNotFoundException("Product not found with id: " + id);
        }
        productRepository.deleteById(id);
    }
}