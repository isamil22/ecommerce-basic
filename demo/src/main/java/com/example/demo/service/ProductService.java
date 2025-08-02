package com.example.demo.service;

import com.example.demo.dto.ProductDTO;
import com.example.demo.dto.ProductVariantDto;
import com.example.demo.dto.VariantTypeDto;
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
    private VariantMapper variantMapper;

    @Autowired
    private ProductSpecification productSpecification;

    @Autowired
    private CustomPackRuleMapper customPackRuleMapper;

    @Transactional
    public ProductDTO createProductWithImages(ProductDTO productDTO, List<MultipartFile> images) throws IOException {
        validateProductData(productDTO);
        if (productDTO.isHasVariants()) {
            validateProductVariants(productDTO);
        }

        Product product = productMapper.toEntity(productDTO);

        Category category = categoryRepository.findById(productDTO.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + productDTO.getCategoryId()));
        product.setCategory(category);

        product.setType(productDTO.getType());
        product.setHasVariants(productDTO.isHasVariants());
        product.setPackable(productDTO.isPackable());

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
        if (productDTO.isHasVariants()) {
            validateProductVariants(productDTO);
        }

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
        if (product.getCustomPackRule() != null) {
            product.getCustomPackRule().setProduct(null);
        }
        product.setCustomPackRule(null);

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
            if (productDTO.getVariantTypes() != null) {
                productDTO.getVariantTypes().forEach(vtDto -> {
                    VariantType variantType = new VariantType();
                    variantType.setName(vtDto.getName());
                    variantType.setProduct(product);
                    if (vtDto.getOptions() != null) {
                        List<VariantOption> options = vtDto.getOptions().stream().map(optStr -> {
                            VariantOption option = new VariantOption();
                            option.setValue(optStr);
                            option.setVariantType(variantType);
                            return option;
                        }).collect(Collectors.toList());
                        variantType.setOptions(options);
                    }
                    product.getVariantTypes().add(variantType);
                });
            }
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
        if (productDTO.getName() == null || productDTO.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Product name is required");
        }
        if (productDTO.getPrice() == null || productDTO.getPrice().compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Product price must be non-negative");
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
        for (VariantTypeDto variantType : productDTO.getVariantTypes()) {
            if (variantType.getName() == null || variantType.getName().trim().isEmpty()) {
                throw new IllegalArgumentException("Variant type name is required");
            }
            if (variantType.getOptions() == null || variantType.getOptions().isEmpty()) {
                throw new IllegalArgumentException("Variant type '" + variantType.getName() + "' must have at least one option");
            }
        }
        for (ProductVariantDto variant : productDTO.getVariants()) {
            if (variant.getPrice() == null || variant.getPrice().compareTo(BigDecimal.ZERO) < 0) {
                throw new IllegalArgumentException("All variants must have a valid non-negative price");
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
                .map(variantMapper::toDto)
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
                .map(productMapper::toDto);
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
                .map(productMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductDTO> getNewArrivals() {
        return productRepository.findByNewArrivalIsTrue(Pageable.unpaged()).getContent().stream()
                .map(productMapper::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProductDTO getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
        return productMapper.toDto(product);
    }

    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new ResourceNotFoundException("Product not found with id: " + id);
        }
        productRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<ProductDTO> findPackableProducts() {
        List<Product> products = productRepository.findByIsPackableTrue();
        return productMapper.toDtoList(products);
    }
}

//