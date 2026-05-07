package com.parking.controller;

import com.parking.model.Booking;
import com.parking.model.Slot;
import com.parking.model.User;
import com.parking.service.ParkingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Admin manages: users (slot owners + regular users) and has read-only slot oversight + booking history.
 */
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private ParkingService parkingService;

    // ─── User Management ─────────────────────────────────────────────────────

    @GetMapping("/users")
    public List<User> getAllUsers() {
        return parkingService.getAllUsers();
    }

    @DeleteMapping("/users/{id}")
    public void deleteUser(@PathVariable String id) {
        parkingService.deleteUser(id);
    }

    // ─── Slot Oversight ───────────────────────────────────────────────────────

    @GetMapping("/slots")
    public List<Slot> getAllSlots() {
        return parkingService.getAllSlots();
    }

    @DeleteMapping("/slots")
    public void deleteAllSlots() {
        parkingService.deleteAllSlots();
    }

    // ─── Booking Management ───────────────────────────────────────────────────

    @GetMapping("/bookings")
    public List<Booking> getAllBookings() {
        return parkingService.getAllBookings();
    }

    @DeleteMapping("/bookings")
    public void deleteAllBookings() {
        parkingService.deleteAllBookings();
    }
}
