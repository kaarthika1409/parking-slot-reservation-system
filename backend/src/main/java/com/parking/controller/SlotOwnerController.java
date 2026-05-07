package com.parking.controller;

import com.parking.model.Booking;
import com.parking.model.Slot;
import com.parking.model.BulkSlotRequest;
import com.parking.service.ParkingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Slot owners manage their own parking slots and view bookings on their slots.
 */
@RestController
@RequestMapping("/api/owner")
public class SlotOwnerController {

    @Autowired
    private ParkingService parkingService;

    // ─── Owner's Slots ────────────────────────────────────────────────────────

    @GetMapping("/slots")
    public List<Slot> getMySlots(@RequestParam String ownerId) {
        return parkingService.getSlotsByOwner(ownerId);
    }

    @PostMapping("/slots")
    public Slot saveSlot(@RequestBody Slot slot) {
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
            request.getPricePerHour4W(),
            request.getOwnerId(),
            request.getOwnerName(),
            request.getParkingName(),
            request.getStreet(),
            request.getArea(),
            request.getDistrict()
        );
    }

    @DeleteMapping("/slots/{id}")
    public void deleteMySlot(@PathVariable String id, @RequestParam String ownerId) {
        parkingService.deleteOwnerSlot(id, ownerId);
    }

    @DeleteMapping("/slots")
    public void deleteAllMySlots(@RequestParam String ownerId) {
        parkingService.deleteAllOwnerSlots(ownerId);
    }

    // ─── Bookings on Owner's Slots ────────────────────────────────────────────

    @GetMapping("/bookings")
    public List<Booking> getMySlotBookings(@RequestParam String ownerId) {
        return parkingService.getBookingsForOwner(ownerId);
    }
}
