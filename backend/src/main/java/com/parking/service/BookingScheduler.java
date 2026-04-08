package com.parking.service;

import com.parking.model.Booking;
import com.parking.model.Slot;
import com.parking.repository.BookingRepository;
import com.parking.repository.SlotRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Component
public class BookingScheduler {

    @Autowired
    private BookingRepository bookingRepository;
    
    @Autowired
    private SlotRepository slotRepository;

    // Runs every 60 seconds (60000 milliseconds)
    @Scheduled(fixedRate = 60000)
    public void releaseExpiredSlots() {
        LocalDateTime now = LocalDateTime.now();
        
        // Find bookings that are ACTIVE but their end time has passed
        List<Booking> expiredBookings = bookingRepository.findByBookingStatusAndEndTimeBefore("ACTIVE", now);
        
        for (Booking booking : expiredBookings) {
            // 1. Mark booking as COMPLETED
            booking.setBookingStatus("COMPLETED");
            bookingRepository.save(booking);
            
            // 2. Make the slot available again
            Optional<Slot> slotOpt = slotRepository.findBySlotNumber(booking.getSlotNumber());
            if (slotOpt.isPresent()) {
                Slot slot = slotOpt.get();
                slot.setAvailable(true);
                slotRepository.save(slot);
                System.out.println("Slot " + slot.getSlotNumber() + " automatically set to available. Booking " + booking.getId() + " completed.");
            }
        }
    }
}
