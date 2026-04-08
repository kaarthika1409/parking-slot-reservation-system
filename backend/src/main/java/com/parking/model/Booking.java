package com.parking.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "bookings")
public class Booking {
    @Id
    private String id;
    private String slotId;
    private String slotNumber;
    private String userId;
    private String username;
    private String vehicleNumber;
    private String parkingDate;
    private String parkingTime;
    private int duration;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private double totalAmount;
    private String paymentStatus; // PENDING, PAID
    private String bookingStatus; // ACTIVE, CANCELLED, COMPLETED
}
