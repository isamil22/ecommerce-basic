package com.example.demo.seeder;

import com.example.demo.model.User;
import com.example.demo.model.User.Role;
import com.example.demo.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@Order(2)
public class UserSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            User admin = new User();
            admin.setFullName("Admin User"); // ADDED
            admin.setEmail("admin@example.com");
            admin.setPassword(passwordEncoder.encode("adminpassword"));
            admin.setRole(Role.ADMIN);
            admin.setEmailConfirmation(true);
            admin.setConfirmationCode("123456");
            userRepository.save(admin);

            User user = new User();
            user.setFullName("User Demo"); // ADDED
            user.setEmail("user@example.com");
            user.setPassword(passwordEncoder.encode("userpassword"));
            user.setRole(Role.USER);
            user.setEmailConfirmation(true);
            user.setConfirmationCode("789101");
            userRepository.save(user);

            System.out.println("Default users (admin and regular) have been added to the database.");
        } else {
            System.out.println("Users already exist in the database.");
        }
    }
}