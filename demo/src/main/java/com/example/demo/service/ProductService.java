package com.example.demo.service;

import com.example.demo.dto.ProductDTO;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.mapper.ProductMapper;
import com.example.demo.model.Category;
import com.example.demo.model.Product;
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

        if (images != null && !images.isEmpty()) {
            List<String> imageUrls = uploadAndGetImageUrls(images);
            product.setImages(imageUrls);
        } else {
            product.setImages(new ArrayList<>());
        }

        Product savedProduct = productRepository.save(product);
        return productMapper.toDTO(savedProduct);
    }

    @Transactional
    public ProductDTO updateProductWithImages(Long id, ProductDTO productDTO, List<MultipartFile> images) throws IOException {
        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        existingProduct.setName(productDTO.getName());
        existingProduct.setDescription(productDTO.getDescription());
        existingProduct.setPrice(productDTO.getPrice());
        existingProduct.setQuantity(productDTO.getQuantity());
        existingProduct.setBrand(productDTO.getBrand());
        existingProduct.setBestseller(productDTO.isBestseller());
        existingProduct.setNewArrival(productDTO.isNewArrival());

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

        Product updatedProduct = productRepository.save(existingProduct);
        return productMapper.toDTO(updatedProduct);
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

    /**
     * UPDATED: Fetches products based on filter criteria using Specification
     * and returns a paginated result.
     */
    @Transactional(readOnly = true)
    public Page<ProductDTO> getAllProducts(String search, Long categoryId, BigDecimal minPrice, BigDecimal maxPrice, String brand, Boolean bestseller, Boolean newArrival, Pageable pageable) {
        Specification<Product> spec = productSpecification.getProducts(search, minPrice, maxPrice, brand, bestseller, newArrival, categoryId);
        return productRepository.findAll(spec, pageable)
                .map(productMapper::toDTO);
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