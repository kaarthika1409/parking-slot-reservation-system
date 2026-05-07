package com.parking.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BulkSlotRequest {
    private String location; // Deprecated or used as fallback
    private String parkingName;
    private String street;
    private String area;
    private String district;
    private String prefix;
    private int twoWheelerCount;
    private int fourWheelerCount;
    private double pricePerHour2W;
    private double pricePerHour4W;
    private String ownerId;
    private String ownerName;
}
