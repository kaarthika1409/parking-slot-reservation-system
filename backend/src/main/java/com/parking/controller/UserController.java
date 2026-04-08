package com.parking.controller;

import com.parking.model.Booking;
import com.parking.model.Slot;
import com.parking.service.ParkingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private ParkingService parkingService;

    @GetMapping("/slots")
    public List<Slot> getAllAvailableSlots() {
        return parkingService.getAllSlots();
    }

    @PostMapping("/reserve")
    public Booking reserveSlot(@RequestBody com.parking.model.ReserveRequest request) {
        return parkingService.reserveSlot(request);
    }

    @PostMapping("/pay")
    public Booking processPayment(@RequestParam String bookingId) {
        return parkingService.processPayment(bookingId);
    }

    @GetMapping("/history")
    public List<Booking> getUserHistory(@RequestParam String userId) {
        return parkingService.getUserHistory(userId);
    }
}
