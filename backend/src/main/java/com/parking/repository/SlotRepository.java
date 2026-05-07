package com.parking.repository;

import com.parking.model.Slot;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

import java.util.Optional;

public interface SlotRepository extends MongoRepository<Slot, String> {
    List<Slot> findByAvailable(boolean available);
    Optional<Slot> findBySlotNumber(String slotNumber);
    List<Slot> findByOwnerId(String ownerId);
}
