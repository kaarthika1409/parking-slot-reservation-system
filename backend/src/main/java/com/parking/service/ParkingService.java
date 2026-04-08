package com.parking.service;

import com.parking.model.Booking;
import com.parking.model.Slot;
import com.parking.model.User;
import com.parking.repository.BookingRepository;
import com.parking.repository.SlotRepository;
import com.parking.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Service
public class ParkingService {

    @Autowired
    private SlotRepository slotRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    // Slot Management (Admin)
    public Slot updateSlot(Slot slot) {
        return slotRepository.save(slot);
    }

    public List<Slot> bulkCreateSlots(String location, String prefix, int count2W, int count4W, double price2W, double price4W) {
        java.util.List<Slot> newSlots = new java.util.ArrayList<>();
        
        // 1. Create 2 Wheeler Slots
        for (int i = 1; i <= count2W; i++) {
            Slot slot = new Slot();
            String slotNumber = String.format("%s-2W-%03d", prefix.toUpperCase(), i);
            slot.setSlotNumber(slotNumber);
            slot.setType("Two Wheeler");
            slot.setPricePerHour(price2W);
            slot.setLocation(location);
            slot.setAvailable(true);
            newSlots.add(slotRepository.save(slot));
        }

        // 2. Create 4 Wheeler Slots
        for (int i = 1; i <= count4W; i++) {
            Slot slot = new Slot();
            String slotNumber = String.format("%s-4W-%03d", prefix.toUpperCase(), i);
            slot.setSlotNumber(slotNumber);
            slot.setType("Four Wheeler");
            slot.setPricePerHour(price4W);
            slot.setLocation(location);
            slot.setAvailable(true);
            newSlots.add(slotRepository.save(slot));
        }
        
        return newSlots;
    }

    public void deleteAllSlots() {
        slotRepository.deleteAll();
    }

    public void deleteAllBookings() {
        // Also make slots available again when bookings are cleared
        List<Booking> activeBookings = bookingRepository.findAll();
        for (Booking b : activeBookings) {
            Optional<Slot> slotOpt = slotRepository.findBySlotNumber(b.getSlotNumber());
            if (slotOpt.isPresent()) {
                Slot slot = slotOpt.get();
                slot.setAvailable(true);
                slotRepository.save(slot);
            }
        }
        bookingRepository.deleteAll();
    }

    public List<Slot> getAllSlots() {
        return slotRepository.findAll();
    }

    // Reservation Logic (User)
    public Booking reserveSlot(com.parking.model.ReserveRequest request) {
        Optional<Slot> slotOpt = slotRepository.findById(request.getSlotId());
        if (slotOpt.isEmpty() || !slotOpt.get().isAvailable()) {
            throw new RuntimeException("Slot not available");
        }

        Slot slot = slotOpt.get();
        slot.setAvailable(false);
        slotRepository.save(slot);

        Booking booking = new Booking();
        booking.setSlotId(slot.getId());
        booking.setSlotNumber(slot.getSlotNumber());
        booking.setUserId(request.getUserId());
        
        // Fetch user to set the username
        Optional<com.parking.model.User> userOpt = userRepository.findById(request.getUserId());
        if (userOpt.isPresent()) {
            booking.setUsername(userOpt.get().getFullName());
        }
        
        booking.setVehicleNumber(request.getVehicleNumber());
        booking.setParkingDate(request.getParkingDate());
        booking.setParkingTime(request.getParkingTime());
        booking.setDuration(request.getDuration());
        
        // Validate required fields
        if (request.getParkingDate() == null || request.getParkingDate().isEmpty()) {
            throw new RuntimeException("Parking Date is required.");
        }
        if (request.getParkingTime() == null || request.getParkingTime().isEmpty()) {
            throw new RuntimeException("Starting Time is required.");
        }
        if (request.getEndTime() == null || request.getEndTime().isEmpty()) {
            throw new RuntimeException("Ending Time is required.");
        }

        // Parse the user-selected date and time
        LocalDateTime start;
        LocalDateTime end;
        double calculatedDuration = request.getDuration();

        try {
            LocalDate date = LocalDate.parse(request.getParkingDate());
            LocalTime startTime = LocalTime.parse(request.getParkingTime());
            start = LocalDateTime.of(date, startTime);
            
            if (request.getEndTime() != null && !request.getEndTime().isEmpty()) {
                LocalTime endTime = LocalTime.parse(request.getEndTime());
                end = LocalDateTime.of(date, endTime);
                
                // If end time is before start time, assume it's the next day
                if (end.isBefore(start)) {
                    end = end.plusDays(1);
                }
                
                // Calculate duration in hours
                java.time.Duration diff = java.time.Duration.between(start, end);
                calculatedDuration = diff.toMinutes() / 60.0;
                
                if (calculatedDuration <= 0) {
                    throw new RuntimeException("Ending time must be after starting time.");
                }
            } else {
                end = start.plusHours(request.getDuration());
            }
        } catch (RuntimeException e) {
            // Rethrow specific validation errors
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Invalid date or time format: " + e.getMessage());
        }
        
        booking.setStartTime(start);
        booking.setEndTime(end);
        booking.setDuration((int) Math.ceil(calculatedDuration));
        booking.setTotalAmount(slot.getPricePerHour() * calculatedDuration);
        
        booking.setPaymentStatus("PENDING");
        booking.setBookingStatus("ACTIVE");

        return bookingRepository.save(booking);
    }

    public Booking processPayment(String bookingId) {
        Optional<Booking> bookingOpt = bookingRepository.findById(bookingId);
        if (bookingOpt.isEmpty()) {
            throw new RuntimeException("Booking not found");
        }

        Booking booking = bookingOpt.get();
        booking.setPaymentStatus("PAID");
        return bookingRepository.save(booking);
    }

    public List<Booking> getUserHistory(String userId) {
        return bookingRepository.findByUserId(userId);
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }
}
