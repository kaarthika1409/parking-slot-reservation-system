package com.parking.model;

import lombok.Data;

@Data
public class ReserveRequest {
    private String userId;
    private String slotId;
    private String vehicleType;
    private String vehicleNumber;
    private String parkingDate;
    private String parkingTime;
    private String endTime;
    private int duration;
}
