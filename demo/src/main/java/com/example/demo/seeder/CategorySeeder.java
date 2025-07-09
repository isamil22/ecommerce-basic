package com.example.demo.seeder;

import com.example.demo.model.Category;
import com.example.demo.repositories.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
@Order(1) // Ensures this runs first
public class CategorySeeder implements CommandLineRunner {

    @Autowired
    private CategoryRepository categoryRepository;

    @Override
    public void run(String... args) throws Exception {
        if (categoryRepository.count() == 0) {
            // Updated Category constructor to include an image URL
            Category skincare = new Category(null, "Skincare", "Products for skin health.", "https://placehold.co/400x400/FFF0F5/E91E63?text=Skincare");
            Category makeup = new Category(null, "Makeup", "Cosmetics for enhancing appearance.", "https://placehold.co/400x400/E1F5FE/E91E63?text=Makeup");
            Category haircare = new Category(null, "Haircare", "Products for hair hygiene.", "https://placehold.co/400x400/F1F8E9/E91E63?text=Haircare");
            Category fragrance = new Category(null, "Fragrance", "Perfumes and scented products.", "https://placehold.co/400x400/F3E5F5/E91E63?text=Fragrance");
            Category bathAndBody = new Category(null, "Bath & Body", "Soaps, scrubs, and lotions.", "https://placehold.co/400x400/E0F2F1/E91E63?text=Body");
            Category tools = new Category(null, "Tools & Brushes", "Makeup and skincare tools.", "https://placehold.co/400x400/ECEFF1/E91E63?text=Tools");


            List<Category> categories = Arrays.asList(skincare, makeup, haircare, fragrance, bathAndBody, tools);
            categoryRepository.saveAll(categories);
            System.out.println("Default beauty categories have been added to the database.");
        } else {
            System.out.println("Categories already exist in the database.");
        }
    }
}