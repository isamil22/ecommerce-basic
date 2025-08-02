package com.example.demo;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles; // Import this

@SpringBootTest
@ActiveProfiles("test") // Add this line
class EcomercebasicApplicationTests {

	@Test
	void contextLoads() {
	}

}