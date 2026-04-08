package com.parking.controller;

import com.parking.model.User;
import com.parking.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/login")
    public User login(@RequestBody User loginData) {
        Optional<User> userOpt = userRepository.findByUsername(loginData.getUsername());
        if (userOpt.isPresent() && userOpt.get().getPassword().equals(loginData.getPassword())) {
            User user = userOpt.get();
            if (loginData.getRole() != null && !loginData.getRole().equalsIgnoreCase(user.getRole())) {
                throw new RuntimeException("Invalid role for this login portal");
            }
            return user; // In a real app, use JWT and hashed passwords
        }
        throw new RuntimeException("Invalid credentials");
    }

    @PostMapping("/register")
    public User register(@RequestBody User user) {
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            throw new RuntimeException("Username already exists");
        }
        return userRepository.save(user);
    }
}
