package com.parking.controller;

import com.parking.model.Booking;
import com.parking.model.Slot;
import com.parking.model.BulkSlotRequest;
import com.parking.service.ParkingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private ParkingService parkingService;

    @GetMapping("/slots")
    public List<Slot> getAllSlots() {
        return parkingService.getAllSlots();
    }

    @PostMapping("/slots")
    public Slot updateSlot(@RequestBody Slot slot) {
        return parkingService.updateSlot(slot);
    }

    @PostMapping("/slots/bulk")
    public List<Slot> createBulkSlots(@RequestBody BulkSlotRequest request) {
        return parkingService.bulkCreateSlots(
            request.getLocation(), 
            request.getPrefix(), 
            request.getTwoWheelerCount(), 
            request.getFourWheelerCount(), 
            request.getPricePerHour2W(), 
            request.getPricePerHour4W()
        );
    }

    @DeleteMapping("/slots")
    public void deleteAllSlots() {
        parkingService.deleteAllSlots();
    }

    @GetMapping("/bookings")
    public List<Booking> getAllBookings() {
        return parkingService.getAllBookings();
    }

    @DeleteMapping("/bookings")
    public void deleteAllBookings() {
        parkingService.deleteAllBookings();
    }
}
