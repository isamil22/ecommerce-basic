package com.example.demo.service;

import com.example.demo.dto.CustomPackRuleDto;
import com.example.demo.dto.ProductDTO;
import com.example.demo.dto.ProductVariantDto;
import com.example.demo.dto.VariantTypeDto;
import com.example.demo.exception.PackValidationException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.mapper.CustomPackRuleMapper;
import com.example.demo.mapper.ProductMapper;
import com.example.demo.mapper.VariantMapper;
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
    private VariantMapper variantMapper;

    @Autowired
    private ProductSpecification productSpecification;

    @Autowired
    private CustomPackRuleMapper customPackRuleMapper;

    @Transactional
    public ProductDTO createProductWithImages(ProductDTO productDTO, List<MultipartFile> images) throws IOException {
        validateProductData(productDTO);

        Product product = productMapper.toEntity(productDTO);

        Category category = categoryRepository.findById(productDTO.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + productDTO.getCategoryId()));
        product.setCategory(category);

        if (images != null && !images.isEmpty()) {
            List<String> imageUrls = uploadAndGetImageUrls(images);
            product.setImages(imageUrls);
        } else {
            product.setImages(new ArrayList<>());
        }

        updateProductSubEntities(product, productDTO);

        Product savedProduct = productRepository.save(product);
        return productMapper.toDto(savedProduct);
    }

    @Transactional
    public ProductDTO updateProductWithImages(Long id, ProductDTO productDTO, List<MultipartFile> images) throws IOException {
        validateProductData(productDTO);

        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        updateProductFromDto(existingProduct, productDTO);

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

        updateProductSubEntities(existingProduct, productDTO);

        Product updatedProduct = productRepository.save(existingProduct);
        return productMapper.toDto(updatedProduct);
    }

    private void updateProductSubEntities(Product product, ProductDTO productDTO) {
        updateVariantsForProduct(product, productDTO);
        updateCustomPackRuleForProduct(product, productDTO);
    }

    private void updateCustomPackRuleForProduct(Product product, ProductDTO productDTO) {
        // Clear existing rule relationship
        if (product.getCustomPackRule() != null) {
            product.getCustomPackRule().setProduct(null);
        }
        product.setCustomPackRule(null);

        // If packable, create and set the new rule
        if (product.isPackable() && productDTO.getCustomPackRule() != null) {
            CustomPackRule rule = customPackRuleMapper.toEntity(productDTO.getCustomPackRule());
            rule.setProduct(product);
            product.setCustomPackRule(rule);
        }
    }

    private void updateVariantsForProduct(Product product, ProductDTO productDTO) {
        product.getVariantTypes().clear();
        product.getVariants().clear();

        if (productDTO.isHasVariants()) {
            // ... (rest of the variant logic remains the same)
        }
    }

    private void updateProductFromDto(Product product, ProductDTO dto) {
        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());
        product.setQuantity(dto.getQuantity());
        product.setBrand(dto.getBrand());
        product.setBestseller(dto.isBestseller());
        product.setNewArrival(dto.isNewArrival());
        product.setType(dto.getType());
        product.setHasVariants(dto.isHasVariants());
        product.setPackable(dto.isPackable());
    }

    private void validateProductData(ProductDTO productDTO) {
        // Basic Product Validation
        if (productDTO.getName() == null || productDTO.getName().trim().isEmpty()) {
            throw new PackValidationException("Product name is required");
        }
        if (productDTO.getPrice() == null || productDTO.getPrice().compareTo(BigDecimal.ZERO) < 0) {
            throw new PackValidationException("Product price must be non-negative");
        }
        // ... (other basic validations)

        // Packable Product Validation Logic
        if (productDTO.isPackable()) {
            if (productDTO.getCustomPackRule() == null) {
                throw new PackValidationException("Packable products must have pack rules defined.");
            }
            validateCustomPackRule(productDTO.getCustomPackRule());
        } else {
            if (productDTO.getCustomPackRule() != null) {
                throw new PackValidationException("Non-packable products should not have pack rules.");
            }
        }
    }

    private void validateCustomPackRule(CustomPackRuleDto rule) {
        if (rule.getMinItems() <= 0) {
            throw new PackValidationException("Minimum items must be greater than 0.");
        }
        if (rule.getMaxItems() < rule.getMinItems()) {
            throw new PackValidationException("Maximum items must be greater than or equal to minimum items.");
        }
        if (rule.getMaxItems() > 20) {
            throw new PackValidationException("Maximum items cannot exceed 20.");
        }
        if (rule.getAllowedProductCategoryIds() != null && !rule.getAllowedProductCategoryIds().isEmpty()) {
            for (Long categoryId : rule.getAllowedProductCategoryIds()) {
                if (!categoryRepository.existsById(categoryId)) {
                    throw new PackValidationException("Invalid category ID provided in pack rules: " + categoryId);
                }
            }
        }
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
                .map(productMapper::toDto);
    }

    @Transactional(readOnly = true)
    public List<ProductDTO> findPackableProducts() {
        List<Product> products = productRepository.findByIsPackableTrue();
        return productMapper.toDtoList(products);
    }

    // ... (all other existing read-only methods like getProductById, getBestsellers, etc.)
}