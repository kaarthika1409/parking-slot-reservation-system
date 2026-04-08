package com.parking.repository;

import com.parking.model.Booking;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface BookingRepository extends MongoRepository<Booking, String> {
    List<Booking> findByUserId(String userId);
    List<Booking> findBySlotIdAndBookingStatus(String slotId, String bookingStatus);
    List<Booking> findByBookingStatusAndEndTimeBefore(String bookingStatus, java.time.LocalDateTime endTime);
}
