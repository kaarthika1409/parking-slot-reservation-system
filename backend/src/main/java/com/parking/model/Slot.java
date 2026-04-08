package com.parking.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "slots")
public class Slot {
    @Id
    private String id;
    private String slotNumber;
    private String type; // Two Wheeler, Four Wheeler
    private boolean available = true;
    private double pricePerHour;
    private String location; // Floor 1, Floor 2, etc.
}
