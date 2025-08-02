package com.example.demo.service;

import com.example.demo.dto.ProductDTO;
import com.example.demo.dto.ProductVariantDto;
import com.example.demo.dto.VariantTypeDto;
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
import java.util.*;
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
        // Validate product data
        validateProductData(productDTO);

        if (productDTO.getHasVariants() != null && productDTO.getHasVariants()) {
            validateProductVariants(productDTO);
        }

        Product product = productMapper.toEntity(productDTO);

        // Set category
        Category category = categoryRepository.findById(productDTO.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + productDTO.getCategoryId()));
        product.setCategory(category);

        // Set basic fields
        product.setType(productDTO.getType());
        product.setHasVariants(productDTO.getHasVariants() != null ? productDTO.getHasVariants() : false);

        // Handle images
        if (images != null && !images.isEmpty()) {
            List<String> imageUrls = uploadAndGetImageUrls(images);
            product.setImages(imageUrls);
        } else {
            product.setImages(new ArrayList<>());
        }

        // Handle variants
        updateVariantsForProduct(product, productDTO);

        Product savedProduct = productRepository.save(product);
        return productMapper.toDTO(savedProduct);
    }

    @Transactional
    public ProductDTO updateProductWithImages(Long id, ProductDTO productDTO, List<MultipartFile> images) throws IOException {
        // Validate product data
        validateProductData(productDTO);

        if (productDTO.getHasVariants() != null && productDTO.getHasVariants()) {
            validateProductVariants(productDTO);
        }

        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        // Update basic fields
        productMapper.updateProductFromDto(productDTO, existingProduct);
        existingProduct.setHasVariants(productDTO.getHasVariants() != null ? productDTO.getHasVariants() : false);

        // Update category if changed
        if (!existingProduct.getCategory().getId().equals(productDTO.getCategoryId())) {
            Category category = categoryRepository.findById(productDTO.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + productDTO.getCategoryId()));
            existingProduct.setCategory(category);
        }

        // Handle images
        if (images != null && !images.isEmpty()) {
            List<String> imageUrls = uploadAndGetImageUrls(images);
            existingProduct.getImages().clear();
            existingProduct.getImages().addAll(imageUrls);
        }

        // Handle variants
        updateVariantsForProduct(existingProduct, productDTO);

        Product updatedProduct = productRepository.save(existingProduct);
        return productMapper.toDTO(updatedProduct);
    }

    private void updateVariantsForProduct(Product product, ProductDTO productDTO) {
        // Clear existing variants
        product.getVariantTypes().clear();
        product.getVariants().clear();

        // Only process variants if hasVariants is true
        if (productDTO.getHasVariants() != null && productDTO.getHasVariants()) {
            // Process variant types
            if (productDTO.getVariantTypes() != null && !productDTO.getVariantTypes().isEmpty()) {
                productDTO.getVariantTypes().forEach(vtDto -> {
                    if (vtDto.getName() == null || vtDto.getName().trim().isEmpty()) {
                        throw new IllegalArgumentException("Variant type name cannot be empty");
                    }

                    VariantType variantType = new VariantType();
                    variantType.setName(vtDto.getName().trim());
                    variantType.setProduct(product);

                    List<VariantOption> options = new ArrayList<>();
                    if (vtDto.getOptions() != null && !vtDto.getOptions().isEmpty()) {
                        Set<String> uniqueOptions = new LinkedHashSet<>();
                        vtDto.getOptions().forEach(optionValue -> {
                            if (optionValue != null && !optionValue.trim().isEmpty()) {
                                uniqueOptions.add(optionValue.trim());
                            }
                        });

                        uniqueOptions.forEach(optionValue -> {
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

            // Process product variants
            if (productDTO.getVariants() != null && !productDTO.getVariants().isEmpty()) {
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
    }

    private void validateProductData(ProductDTO productDTO) {
        if (productDTO.getName() == null || productDTO.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Product name is required");
        }
        if (productDTO.getPrice() == null || productDTO.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Product price must be positive");
        }
        if (productDTO.getQuantity() == null || productDTO.getQuantity() < 0) {
            throw new IllegalArgumentException("Product quantity cannot be negative");
        }
        if (productDTO.getCategoryId() == null) {
            throw new IllegalArgumentException("Category is required");
        }
    }

    private void validateProductVariants(ProductDTO productDTO) {
        if (productDTO.getVariantTypes() == null || productDTO.getVariantTypes().isEmpty()) {
            throw new IllegalArgumentException("At least one variant type is required when variants are enabled");
        }

        if (productDTO.getVariants() == null || productDTO.getVariants().isEmpty()) {
            throw new IllegalArgumentException("At least one variant is required when variants are enabled");
        }

        // Validate variant types
        for (VariantTypeDto variantType : productDTO.getVariantTypes()) {
            if (variantType.getName() == null || variantType.getName().trim().isEmpty()) {
                throw new IllegalArgumentException("Variant type name is required");
            }
            if (variantType.getOptions() == null || variantType.getOptions().isEmpty()) {
                throw new IllegalArgumentException("Variant type '" + variantType.getName() + "' must have at least one option");
            }
        }

        // Validate variants
        for (ProductVariantDto variant : productDTO.getVariants()) {
            if (variant.getPrice() == null || variant.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
                throw new IllegalArgumentException("All variants must have a valid positive price");
            }
            if (variant.getStock() < 0) {
                throw new IllegalArgumentException("Variant stock cannot be negative");
            }
            if (variant.getVariantMap() == null || variant.getVariantMap().isEmpty()) {
                throw new IllegalArgumentException("All variants must have variant attributes defined");
            }
        }
    }

    @Transactional(readOnly = true)
    public List<ProductVariantDto> getProductVariants(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + productId));

        return product.getVariants().stream()
                .map(productMapper::productVariantToProductVariantDto)
                .collect(Collectors.toList());
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