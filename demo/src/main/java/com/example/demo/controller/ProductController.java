package com.example.demo.controller;

import com.example.demo.dto.ProductDTO;
import com.example.demo.dto.ProductVariantDto;
import com.example.demo.service.ProductService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
public class ProductController {

    @Autowired
    private ProductService productService;

    // Add an ObjectMapper instance to manually handle JSON deserialization
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Creates a new product with optional images. The product data is sent as a JSON string
     * to avoid Content-Type issues with multipart requests from clients like Swagger.
     */
    @PostMapping(consumes = { "multipart/form-data" })
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductDTO> addProduct(
            @RequestPart("product") String productJson, // Changed from ProductDTO to String
            @RequestPart(value = "images", required = false) List<MultipartFile> images) throws IOException {

        // Manually deserialize the JSON string to a ProductDTO
        ProductDTO productDTO = objectMapper.readValue(productJson, ProductDTO.class);

        ProductDTO newProduct = productService.createProductWithImages(productDTO, images);
        return new ResponseEntity<>(newProduct, HttpStatus.CREATED);
    }

    /**
     * Updates an existing product with optional new images. The product data is sent as a JSON string.
     */
    @PutMapping(value = "/{id}", consumes = { "multipart/form-data" })
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductDTO> updateProduct(
            @PathVariable Long id,
            @RequestPart("product") String productJson, // Changed from ProductDTO to String
            @RequestPart(value = "images", required = false) List<MultipartFile> images) throws IOException {

        // Manually deserialize the JSON string to a ProductDTO
        ProductDTO productDTO = objectMapper.readValue(productJson, ProductDTO.class);

        ProductDTO updatedProduct = productService.updateProductWithImages(id, productDTO, images);
        return ResponseEntity.ok(updatedProduct);
    }

    @GetMapping("/suggestions")
    public ResponseEntity<List<String>> getProductSuggestions(@RequestParam String query) {
        return ResponseEntity.ok(productService.getProductSuggestions(query));
    }

    @PostMapping("/description-image")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> uploadDescriptionImage(@RequestParam("image") MultipartFile image) {
        try {
            String imageUrl = productService.uploadAndGetImageUrl(image);
            return ResponseEntity.ok(Map.of("url", imageUrl));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to upload image");
        }
    }


    @GetMapping("/bestsellers")
    public ResponseEntity<List<ProductDTO>> getBestsellers() {
        return ResponseEntity.ok(productService.getBestsellers());
    }

    @GetMapping("/new-arrivals")
    public ResponseEntity<List<ProductDTO>> getNewArrivals() {
        return ResponseEntity.ok(productService.getNewArrivals());
    }

    /**
     * UPDATED: This method now handles filtering, pagination, and sorting for products.
     * It accepts various request parameters to filter the results dynamically.
     */
    @GetMapping
    public ResponseEntity<Page<ProductDTO>> getAllProducts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) Boolean bestseller,
            @RequestParam(required = false) Boolean newArrival,
            @RequestParam(required = false) String type,
            Pageable pageable) {
        Page<ProductDTO> products = productService.getAllProducts(search, categoryId, minPrice, maxPrice, brand, bestseller, newArrival, type, pageable);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDTO> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/variants")
    public ResponseEntity<List<ProductVariantDto>> getProductVariants(@PathVariable Long id) {
        // You would need to add a 'getProductVariants' method to your service
        List<ProductVariantDto> variants = productService.getProductVariants(id);
        return ResponseEntity.ok(variants);
    }

    @GetMapping("/packable")
    public ResponseEntity<List<ProductDTO>> getPackableProducts() {
        return ResponseEntity.ok(productService.getPackableProducts());
    }
}