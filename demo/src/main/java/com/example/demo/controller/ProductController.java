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

    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostMapping(consumes = { "multipart/form-data" })
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductDTO> addProduct(
            @RequestPart("product") String productJson,
            @RequestPart(value = "images", required = false) List<MultipartFile> images) throws IOException {
        ProductDTO productDTO = objectMapper.readValue(productJson, ProductDTO.class);
        ProductDTO newProduct = productService.createProductWithImages(productDTO, images);
        return new ResponseEntity<>(newProduct, HttpStatus.CREATED);
    }

    @PutMapping(value = "/{id}", consumes = { "multipart/form-data" })
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductDTO> updateProduct(
            @PathVariable Long id,
            @RequestPart("product") String productJson,
            @RequestPart(value = "images", required = false) List<MultipartFile> images) throws IOException {
        ProductDTO productDTO = objectMapper.readValue(productJson, ProductDTO.class);
        ProductDTO updatedProduct = productService.updateProductWithImages(id, productDTO, images);
        return ResponseEntity.ok(updatedProduct);
    }

    // *** NEW ENDPOINT ***
    /**
     * Finds all products that are marked as "packable".
     * This endpoint is for public use, allowing users to see which bases they can select
     * for building a custom pack.
     *
     * @return A list of products that can be used to build a custom pack.
     */
    @GetMapping("/packable")
    public ResponseEntity<List<ProductDTO>> getPackableProducts() {
        List<ProductDTO> packableProducts = productService.findPackableProducts();
        return ResponseEntity.ok(packableProducts);
    }

    // ----- Other Existing Endpoints (No Changes Needed) -----

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
        List<ProductVariantDto> variants = productService.getProductVariants(id);
        return ResponseEntity.ok(variants);
    }
}