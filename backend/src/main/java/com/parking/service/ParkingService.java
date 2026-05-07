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
import java.util.stream.Collectors;

@Service
public class ParkingService {

    @Autowired
    private SlotRepository slotRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    // ─── Slot Management (Admin read-only + Owner CRUD) ───────────────────────

    public Slot updateSlot(Slot slot) {
        return slotRepository.save(slot);
    }

    /**
     * Bulk create slots and stamp them with the owner's identity.
     */
    public List<Slot> bulkCreateSlots(String location, String prefix, int count2W, int count4W,
                                      double price2W, double price4W,
                                      String ownerId, String ownerName,
                                      String parkingName, String street, String area, String district) {
        java.util.List<Slot> newSlots = new java.util.ArrayList<>();

        // Generate combined location string for fallback backward compatibility
        String combinedLocation = String.format("%s, %s, %s, %s", parkingName, street, area, district);

        for (int i = 1; i <= count2W; i++) {
            Slot slot = new Slot();
            String slotNumber = String.format("%s-2W-%03d", prefix.toUpperCase(), i);
            slot.setSlotNumber(slotNumber);
            slot.setType("Two Wheeler");
            slot.setPricePerHour(price2W);
            slot.setLocation(combinedLocation);
            slot.setParkingName(parkingName);
            slot.setStreet(street);
            slot.setArea(area);
            slot.setDistrict(district);
            slot.setAvailable(true);
            slot.setOwnerId(ownerId);
            slot.setOwnerName(ownerName);
            newSlots.add(slotRepository.save(slot));
        }

        for (int i = 1; i <= count4W; i++) {
            Slot slot = new Slot();
            String slotNumber = String.format("%s-4W-%03d", prefix.toUpperCase(), i);
            slot.setSlotNumber(slotNumber);
            slot.setType("Four Wheeler");
            slot.setPricePerHour(price4W);
            slot.setLocation(combinedLocation);
            slot.setParkingName(parkingName);
            slot.setStreet(street);
            slot.setArea(area);
            slot.setDistrict(district);
            slot.setAvailable(true);
            slot.setOwnerId(ownerId);
            slot.setOwnerName(ownerName);
            newSlots.add(slotRepository.save(slot));
        }

        return newSlots;
    }

    public void deleteAllSlots() {
        slotRepository.deleteAll();
    }

    public void deleteSlot(String id) {
        slotRepository.deleteById(id);
    }

    public List<Slot> getAllSlots() {
        return slotRepository.findAll();
    }

    // ─── Owner-scoped Slot Methods ────────────────────────────────────────────

    public List<Slot> getSlotsByOwner(String ownerId) {
        return slotRepository.findByOwnerId(ownerId);
    }

    public void deleteOwnerSlot(String slotId, String ownerId) {
        Optional<Slot> slotOpt = slotRepository.findById(slotId);
        if (slotOpt.isPresent() && ownerId.equals(slotOpt.get().getOwnerId())) {
            slotRepository.deleteById(slotId);
        } else {
            throw new RuntimeException("Slot not found or not owned by you");
        }
    }

    public void deleteAllOwnerSlots(String ownerId) {
        List<Slot> ownerSlots = slotRepository.findByOwnerId(ownerId);
        slotRepository.deleteAll(ownerSlots);
    }

    /**
     * Get bookings where the slot belongs to a specific owner.
     */
    public List<Booking> getBookingsForOwner(String ownerId) {
        List<Slot> ownerSlots = slotRepository.findByOwnerId(ownerId);
        List<String> slotIds = ownerSlots.stream().map(Slot::getId).collect(Collectors.toList());
        return bookingRepository.findAll().stream()
                .filter(b -> slotIds.contains(b.getSlotId()))
                .collect(Collectors.toList());
    }

    // ─── Admin User Management ────────────────────────────────────────────────

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public void deleteUser(String userId) {
        userRepository.deleteById(userId);
    }

    // ─── Booking Logic (shared) ───────────────────────────────────────────────

    public void deleteAllBookings() {
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

    // ─── Reservation Logic (User) ─────────────────────────────────────────────

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

        Optional<com.parking.model.User> userOpt = userRepository.findById(request.getUserId());
        if (userOpt.isPresent()) {
            booking.setUsername(userOpt.get().getFullName());
        }

        booking.setVehicleNumber(request.getVehicleNumber());
        booking.setParkingDate(request.getParkingDate());
        booking.setParkingTime(request.getParkingTime());
        booking.setDuration(request.getDuration());

        if (request.getParkingDate() == null || request.getParkingDate().isEmpty()) {
            throw new RuntimeException("Parking Date is required.");
        }
        if (request.getParkingTime() == null || request.getParkingTime().isEmpty()) {
            throw new RuntimeException("Starting Time is required.");
        }
        if (request.getEndTime() == null || request.getEndTime().isEmpty()) {
            throw new RuntimeException("Ending Time is required.");
        }

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

                if (end.isBefore(start)) {
                    end = end.plusDays(1);
                }

                java.time.Duration diff = java.time.Duration.between(start, end);
                calculatedDuration = diff.toMinutes() / 60.0;

                if (calculatedDuration <= 0) {
                    throw new RuntimeException("Ending time must be after starting time.");
                }
            } else {
                end = start.plusHours(request.getDuration());
            }
        } catch (RuntimeException e) {
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
