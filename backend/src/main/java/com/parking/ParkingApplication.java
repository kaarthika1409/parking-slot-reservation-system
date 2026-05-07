package com.parking;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.boot.CommandLineRunner;
import com.parking.model.User;
import com.parking.model.Slot;
import com.parking.repository.UserRepository;
import com.parking.repository.SlotRepository;
import java.util.Optional;
import java.util.List;

import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ParkingApplication {

    public static void main(String[] args) {
        SpringApplication.run(ParkingApplication.class, args);
    }

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**").allowedOrigins("http://localhost:5173").allowedMethods("*");
            }
        };
    }

    @Bean
    public CommandLineRunner initDatabase(UserRepository userRepository, SlotRepository slotRepository) {
        return args -> {
            // Seed Admin
            Optional<User> adminOpt = userRepository.findByUsername("admin");
            if (adminOpt.isEmpty()) {
                User admin = new User();
                admin.setUsername("admin");
                admin.setPassword("admin");
                admin.setRole("ADMIN");
                admin.setFullName("System Administrator");
                userRepository.save(admin);
            }

            // Slot seeding logic has been removed to prevent auto-creating "Common Area" slots
        };
    }
}
