package com.example.demo.service;

import com.example.demo.dto.ProductDTO;
import com.example.demo.dto.ProductVariantDto;
import com.example.demo.dto.VariantTypeDto;
import com.example.demo.model.Category;
import com.example.demo.model.Product;
import com.example.demo.repositories.CategoryRepository;
import com.example.demo.repositories.ProductRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class ProductVariantTestSuite {

    @Autowired
    private ProductService productService;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    private Category testCategory;
    private ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        // Create a test category
        testCategory = new Category();
        testCategory.setName("Test Category");
        testCategory.setDescription("Test Description");
        testCategory = categoryRepository.save(testCategory);
    }

    /**
     * Test Case 1: Simple Product with Size Variants
     * Tests basic variant functionality with different sizes
     */
    @Test
    void testCreateProductWithSizeVariants() throws Exception {
        ProductDTO productDTO = createBaseProductDTO("T-Shirt with Sizes");
        productDTO.setHasVariants(true);

        // Create size variant type
        VariantTypeDto sizeVariantType = new VariantTypeDto();
        sizeVariantType.setName("Size");
        sizeVariantType.setOptions(Arrays.asList("S", "M", "L", "XL"));
        productDTO.setVariantTypes(Arrays.asList(sizeVariantType));

        // Create size variants
        ProductVariantDto smallVariant = createVariant(
                Map.of("Size", "S"),
                new BigDecimal("19.99"),
                10
        );
        ProductVariantDto mediumVariant = createVariant(
                Map.of("Size", "M"),
                new BigDecimal("19.99"),
                15
        );
        ProductVariantDto largeVariant = createVariant(
                Map.of("Size", "L"),
                new BigDecimal("21.99"),
                12
        );
        ProductVariantDto xlargeVariant = createVariant(
                Map.of("Size", "XL"),
                new BigDecimal("23.99"),
                8
        );

        productDTO.setVariants(Arrays.asList(smallVariant, mediumVariant, largeVariant, xlargeVariant));

        // Test creation
        ProductDTO createdProduct = productService.createProductWithImages(productDTO, null);

        // Assertions
        assertNotNull(createdProduct.getId());
        assertTrue(createdProduct.getHasVariants());
        assertEquals(1, createdProduct.getVariantTypes().size());
        assertEquals(4, createdProduct.getVariants().size());
        assertEquals("Size", createdProduct.getVariantTypes().get(0).getName());
        assertEquals(4, createdProduct.getVariantTypes().get(0).getOptions().size());

        // Verify variants in database
        Product savedProduct = productRepository.findById(createdProduct.getId()).orElse(null);
        assertNotNull(savedProduct);
        assertEquals(4, savedProduct.getVariants().size());
        assertEquals(1, savedProduct.getVariantTypes().size());
    }

    /**
     * Test Case 2: Product with Color and Size Variants (Multiple Variant Types)
     * Tests complex variant combinations
     */
    @Test
    void testCreateProductWithColorAndSizeVariants() throws Exception {
        ProductDTO productDTO = createBaseProductDTO("Polo Shirt - Multi Variant");
        productDTO.setHasVariants(true);

        // Create variant types
        VariantTypeDto colorVariantType = new VariantTypeDto();
        colorVariantType.setName("Color");
        colorVariantType.setOptions(Arrays.asList("Red", "Blue", "Green"));

        VariantTypeDto sizeVariantType = new VariantTypeDto();
        sizeVariantType.setName("Size");
        sizeVariantType.setOptions(Arrays.asList("M", "L"));

        productDTO.setVariantTypes(Arrays.asList(colorVariantType, sizeVariantType));

        // Create all possible combinations (3 colors × 2 sizes = 6 variants)
        ProductVariantDto redMedium = createVariant(
                Map.of("Color", "Red", "Size", "M"),
                new BigDecimal("29.99"),
                5
        );
        ProductVariantDto redLarge = createVariant(
                Map.of("Color", "Red", "Size", "L"),
                new BigDecimal("29.99"),
                3
        );
        ProductVariantDto blueMedium = createVariant(
                Map.of("Color", "Blue", "Size", "M"),
                new BigDecimal("31.99"),
                7
        );
        ProductVariantDto blueLarge = createVariant(
                Map.of("Color", "Blue", "Size", "L"),
                new BigDecimal("31.99"),
                4
        );
        ProductVariantDto greenMedium = createVariant(
                Map.of("Color", "Green", "Size", "M"),
                new BigDecimal("28.99"),
                6
        );
        ProductVariantDto greenLarge = createVariant(
                Map.of("Color", "Green", "Size", "L"),
                new BigDecimal("28.99"),
                2
        );

        productDTO.setVariants(Arrays.asList(
                redMedium, redLarge, blueMedium, blueLarge, greenMedium, greenLarge
        ));

        // Test creation
        ProductDTO createdProduct = productService.createProductWithImages(productDTO, null);

        // Assertions
        assertNotNull(createdProduct.getId());
        assertTrue(createdProduct.getHasVariants());
        assertEquals(2, createdProduct.getVariantTypes().size());
        assertEquals(6, createdProduct.getVariants().size());

        // Verify specific variant combinations
        Product savedProduct = productRepository.findById(createdProduct.getId()).orElse(null);
        assertNotNull(savedProduct);

        // Check if all variant combinations exist
        boolean foundRedMedium = savedProduct.getVariants().stream()
                .anyMatch(v -> "Red".equals(v.getVariantMap().get("Color")) &&
                        "M".equals(v.getVariantMap().get("Size")));
        assertTrue(foundRedMedium, "Red Medium variant should exist");

        boolean foundBlueLarge = savedProduct.getVariants().stream()
                .anyMatch(v -> "Blue".equals(v.getVariantMap().get("Color")) &&
                        "L".equals(v.getVariantMap().get("Size")));
        assertTrue(foundBlueLarge, "Blue Large variant should exist");
    }

    /**
     * Test Case 3: Product with Material, Color, and Size Variants (Triple Variant Types)
     * Tests maximum complexity variant system
     */
    @Test
    void testCreateProductWithTripleVariants() throws Exception {
        ProductDTO productDTO = createBaseProductDTO("Premium Jacket - Triple Variants");
        productDTO.setHasVariants(true);

        // Create three variant types
        VariantTypeDto materialType = new VariantTypeDto();
        materialType.setName("Material");
        materialType.setOptions(Arrays.asList("Cotton", "Polyester"));

        VariantTypeDto colorType = new VariantTypeDto();
        colorType.setName("Color");
        colorType.setOptions(Arrays.asList("Black", "White"));

        VariantTypeDto sizeType = new VariantTypeDto();
        sizeType.setName("Size");
        sizeType.setOptions(Arrays.asList("M", "L"));

        productDTO.setVariantTypes(Arrays.asList(materialType, colorType, sizeType));

        // Create variants (2 materials × 2 colors × 2 sizes = 8 variants)
        ProductVariantDto cottonBlackM = createVariant(
                Map.of("Material", "Cotton", "Color", "Black", "Size", "M"),
                new BigDecimal("89.99"),
                3
        );
        ProductVariantDto cottonBlackL = createVariant(
                Map.of("Material", "Cotton", "Color", "Black", "Size", "L"),
                new BigDecimal("89.99"),
                2
        );
        ProductVariantDto cottonWhiteM = createVariant(
                Map.of("Material", "Cotton", "Color", "White", "Size", "M"),
                new BigDecimal("89.99"),
                4
        );
        ProductVariantDto cottonWhiteL = createVariant(
                Map.of("Material", "Cotton", "Color", "White", "Size", "L"),
                new BigDecimal("89.99"),
                1
        );
        ProductVariantDto polyesterBlackM = createVariant(
                Map.of("Material", "Polyester", "Color", "Black", "Size", "M"),
                new BigDecimal("79.99"),
                5
        );
        ProductVariantDto polyesterBlackL = createVariant(
                Map.of("Material", "Polyester", "Color", "Black", "Size", "L"),
                new BigDecimal("79.99"),
                3
        );
        ProductVariantDto polyesterWhiteM = createVariant(
                Map.of("Material", "Polyester", "Color", "White", "Size", "M"),
                new BigDecimal("79.99"),
                6
        );
        ProductVariantDto polyesterWhiteL = createVariant(
                Map.of("Material", "Polyester", "Color", "White", "Size", "L"),
                new BigDecimal("79.99"),
                2
        );

        productDTO.setVariants(Arrays.asList(
                cottonBlackM, cottonBlackL, cottonWhiteM, cottonWhiteL,
                polyesterBlackM, polyesterBlackL, polyesterWhiteM, polyesterWhiteL
        ));

        // Test creation
        ProductDTO createdProduct = productService.createProductWithImages(productDTO, null);

        // Assertions
        assertNotNull(createdProduct.getId());
        assertTrue(createdProduct.getHasVariants());
        assertEquals(3, createdProduct.getVariantTypes().size());
        assertEquals(8, createdProduct.getVariants().size());

        // Verify complex variant exists
        Product savedProduct = productRepository.findById(createdProduct.getId()).orElse(null);
        assertNotNull(savedProduct);

        boolean foundCottonBlackM = savedProduct.getVariants().stream()
                .anyMatch(v -> "Cotton".equals(v.getVariantMap().get("Material")) &&
                        "Black".equals(v.getVariantMap().get("Color")) &&
                        "M".equals(v.getVariantMap().get("Size")));
        assertTrue(foundCottonBlackM, "Cotton Black Medium variant should exist");
    }

    /**
     * Test Case 4: Product with Variant Images
     * Tests variant with specific images for each variant
     */
    @Test
    void testCreateProductWithVariantImages() throws Exception {
        ProductDTO productDTO = createBaseProductDTO("Sneakers with Variant Images");
        productDTO.setHasVariants(true);

        // Create color variant type
        VariantTypeDto colorVariantType = new VariantTypeDto();
        colorVariantType.setName("Color");
        colorVariantType.setOptions(Arrays.asList("Red", "Blue", "Black"));
        productDTO.setVariantTypes(Arrays.asList(colorVariantType));

        // Create variants with images
        ProductVariantDto redVariant = createVariant(
                Map.of("Color", "Red"),
                new BigDecimal("99.99"),
                5
        );
        redVariant.setImageUrl("https://example.com/red-sneaker.jpg");

        ProductVariantDto blueVariant = createVariant(
                Map.of("Color", "Blue"),
                new BigDecimal("99.99"),
                3
        );
        blueVariant.setImageUrl("https://example.com/blue-sneaker.jpg");

        ProductVariantDto blackVariant = createVariant(
                Map.of("Color", "Black"),
                new BigDecimal("109.99"),
                7
        );
        blackVariant.setImageUrl("https://example.com/black-sneaker.jpg");

        productDTO.setVariants(Arrays.asList(redVariant, blueVariant, blackVariant));

        // Test creation
        ProductDTO createdProduct = productService.createProductWithImages(productDTO, null);

        // Assertions
        assertNotNull(createdProduct.getId());
        assertEquals(3, createdProduct.getVariants().size());

        // Verify images are saved
        Product savedProduct = productRepository.findById(createdProduct.getId()).orElse(null);
        assertNotNull(savedProduct);

        savedProduct.getVariants().forEach(variant -> {
            assertNotNull(variant.getImageUrl(), "Each variant should have an image URL");
            assertTrue(variant.getImageUrl().contains("sneaker.jpg"), "Image URL should be valid");
        });
    }

    /**
     * Test Case 5: Update Product Variants
     * Tests updating existing product with new variants
     */
    @Test
    void testUpdateProductVariants() throws Exception {
        // First create a simple product
        ProductDTO originalProduct = createBaseProductDTO("Updateable Product");
        originalProduct.setHasVariants(false);
        ProductDTO createdProduct = productService.createProductWithImages(originalProduct, null);

        // Now update it to have variants
        ProductDTO updateDTO = createBaseProductDTO("Updated Product with Variants");
        updateDTO.setHasVariants(true);

        VariantTypeDto sizeVariantType = new VariantTypeDto();
        sizeVariantType.setName("Size");
        sizeVariantType.setOptions(Arrays.asList("S", "M", "L"));
        updateDTO.setVariantTypes(Arrays.asList(sizeVariantType));

        ProductVariantDto smallVariant = createVariant(
                Map.of("Size", "S"),
                new BigDecimal("25.99"),
                10
        );
        ProductVariantDto mediumVariant = createVariant(
                Map.of("Size", "M"),
                new BigDecimal("25.99"),
                15
        );
        ProductVariantDto largeVariant = createVariant(
                Map.of("Size", "L"),
                new BigDecimal("27.99"),
                12
        );

        updateDTO.setVariants(Arrays.asList(smallVariant, mediumVariant, largeVariant));

        // Test update
        ProductDTO updatedProduct = productService.updateProductWithImages(
                createdProduct.getId(), updateDTO, null);

        // Assertions
        assertTrue(updatedProduct.getHasVariants());
        assertEquals(1, updatedProduct.getVariantTypes().size());
        assertEquals(3, updatedProduct.getVariants().size());

        // Verify in database
        Product savedProduct = productRepository.findById(updatedProduct.getId()).orElse(null);
        assertNotNull(savedProduct);
        assertTrue(savedProduct.isHasVariants());
        assertEquals(3, savedProduct.getVariants().size());
    }

    /**
     * Test Case 6: Edge Case - Empty Variant Options
     * Tests validation when variant type has no options
     */
    @Test
    void testProductWithEmptyVariantOptions() {
        ProductDTO productDTO = createBaseProductDTO("Product with Empty Variants");
        productDTO.setHasVariants(true);

        VariantTypeDto emptyVariantType = new VariantTypeDto();
        emptyVariantType.setName("Size");
        emptyVariantType.setOptions(Arrays.asList()); // Empty options
        productDTO.setVariantTypes(Arrays.asList(emptyVariantType));

        // This should throw an exception
        assertThrows(IllegalArgumentException.class, () -> {
            productService.createProductWithImages(productDTO, null);
        });
    }

    /**
     * Test Case 7: Edge Case - No Variants with hasVariants=true
     * Tests validation when hasVariants is true but no variants provided
     */
    @Test
    void testProductWithNoVariantsButHasVariantsTrue() {
        ProductDTO productDTO = createBaseProductDTO("Product with No Variants");
        productDTO.setHasVariants(true);
        productDTO.setVariantTypes(Arrays.asList()); // Empty variant types
        productDTO.setVariants(Arrays.asList()); // Empty variants

        // This should throw an exception
        assertThrows(IllegalArgumentException.class, () -> {
            productService.createProductWithImages(productDTO, null);
        });
    }

    /**
     * Test Case 8: Different Pricing for Variants
     * Tests that different variants can have different prices
     */
    @Test
    void testVariantsWithDifferentPricing() throws Exception {
        ProductDTO productDTO = createBaseProductDTO("Premium vs Standard");
        productDTO.setHasVariants(true);

        VariantTypeDto qualityType = new VariantTypeDto();
        qualityType.setName("Quality");
        qualityType.setOptions(Arrays.asList("Standard", "Premium", "Deluxe"));
        productDTO.setVariantTypes(Arrays.asList(qualityType));

        ProductVariantDto standardVariant = createVariant(
                Map.of("Quality", "Standard"),
                new BigDecimal("49.99"),
                20
        );
        ProductVariantDto premiumVariant = createVariant(
                Map.of("Quality", "Premium"),
                new BigDecimal("79.99"),
                15
        );
        ProductVariantDto deluxeVariant = createVariant(
                Map.of("Quality", "Deluxe"),
                new BigDecimal("129.99"),
                5
        );

        productDTO.setVariants(Arrays.asList(standardVariant, premiumVariant, deluxeVariant));

        ProductDTO createdProduct = productService.createProductWithImages(productDTO, null);

        // Verify different prices
        Product savedProduct = productRepository.findById(createdProduct.getId()).orElse(null);
        assertNotNull(savedProduct);

        Map<String, BigDecimal> priceMap = new HashMap<>();
        savedProduct.getVariants().forEach(variant -> {
            priceMap.put(variant.getVariantMap().get("Quality"), variant.getPrice());
        });

        assertEquals(new BigDecimal("49.99"), priceMap.get("Standard"));
        assertEquals(new BigDecimal("79.99"), priceMap.get("Premium"));
        assertEquals(new BigDecimal("129.99"), priceMap.get("Deluxe"));
    }

    /**
     * Test Case 9: JSON Serialization/Deserialization Test
     * Tests that variants survive JSON conversion (like in REST API)
     */
    @Test
    void testVariantJSONSerialization() throws Exception {
        ProductDTO productDTO = createBaseProductDTO("JSON Test Product");
        productDTO.setHasVariants(true);

        VariantTypeDto sizeType = new VariantTypeDto();
        sizeType.setName("Size");
        sizeType.setOptions(Arrays.asList("Small", "Large"));
        productDTO.setVariantTypes(Arrays.asList(sizeType));

        ProductVariantDto smallVariant = createVariant(
                Map.of("Size", "Small"),
                new BigDecimal("19.99"),
                10
        );
        ProductVariantDto largeVariant = createVariant(
                Map.of("Size", "Large"),
                new BigDecimal("21.99"),
                8
        );

        productDTO.setVariants(Arrays.asList(smallVariant, largeVariant));

        // Convert to JSON and back (simulating REST API call)
        String json = objectMapper.writeValueAsString(productDTO);
        ProductDTO deserializedDTO = objectMapper.readValue(json, ProductDTO.class);

        // Test that deserialized DTO can still create product
        ProductDTO createdProduct = productService.createProductWithImages(deserializedDTO, null);

        assertNotNull(createdProduct.getId());
        assertTrue(createdProduct.getHasVariants());
        assertEquals(2, createdProduct.getVariants().size());
    }

    /**
     * Test Case 10: Variant Stock Management
     * Tests that individual variant stock is properly managed
     */
    @Test
    void testVariantStockManagement() throws Exception {
        ProductDTO productDTO = createBaseProductDTO("Stock Management Test");
        productDTO.setHasVariants(true);

        VariantTypeDto sizeType = new VariantTypeDto();
        sizeType.setName("Size");
        sizeType.setOptions(Arrays.asList("S", "M", "L"));
        productDTO.setVariantTypes(Arrays.asList(sizeType));

        // Different stock levels for each variant
        ProductVariantDto smallVariant = createVariant(
                Map.of("Size", "S"),
                new BigDecimal("29.99"),
                0  // Out of stock
        );
        ProductVariantDto mediumVariant = createVariant(
                Map.of("Size", "M"),
                new BigDecimal("29.99"),
                5  // Low stock
        );
        ProductVariantDto largeVariant = createVariant(
                Map.of("Size", "L"),
                new BigDecimal("29.99"),
                100 // High stock
        );

        productDTO.setVariants(Arrays.asList(smallVariant, mediumVariant, largeVariant));

        ProductDTO createdProduct = productService.createProductWithImages(productDTO, null);

        // Verify stock levels
        Product savedProduct = productRepository.findById(createdProduct.getId()).orElse(null);
        assertNotNull(savedProduct);

        Map<String, Integer> stockMap = new HashMap<>();
        savedProduct.getVariants().forEach(variant -> {
            stockMap.put(variant.getVariantMap().get("Size"), variant.getStock());
        });

        assertEquals(0, stockMap.get("S").intValue());
        assertEquals(5, stockMap.get("M").intValue());
        assertEquals(100, stockMap.get("L").intValue());
    }

    // Helper Methods

    private ProductDTO createBaseProductDTO(String name) {
        ProductDTO productDTO = new ProductDTO();
        productDTO.setName(name);
        productDTO.setDescription("Test product description");
        productDTO.setPrice(new BigDecimal("29.99"));
        productDTO.setQuantity(50);
        productDTO.setBrand("Test Brand");
        productDTO.setCategoryId(testCategory.getId());
        productDTO.setType(Product.ProductType.BOTH);
        productDTO.setBestseller(false);
        productDTO.setNewArrival(false);
        return productDTO;
    }

    private ProductVariantDto createVariant(Map<String, String> variantMap, BigDecimal price, int stock) {
        ProductVariantDto variant = new ProductVariantDto();
        variant.setVariantMap(variantMap);
        variant.setPrice(price);
        variant.setStock(stock);
        return variant;
    }
}


