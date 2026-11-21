package com.intellihr.recruitment.candidate.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class ResumeStorageService {

    private final Path storageLocation;

    public ResumeStorageService(
            @Value("${app.resume.storage-location}") String storageLocation) {
        this.storageLocation = Paths.get(storageLocation)
                .toAbsolutePath()
                .normalize();
    }

    public String storeResume(MultipartFile file) {

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Resume file cannot be empty");
        }

        String originalFilename = file.getOriginalFilename();

        if (originalFilename == null ||
                !originalFilename.toLowerCase().endsWith(".pdf")) {
            throw new IllegalArgumentException("Only PDF resume files are allowed");
        }

        try {
            Files.createDirectories(storageLocation);

            String storedFilename = UUID.randomUUID() + ".pdf";

            Path destination = storageLocation.resolve(storedFilename).normalize();

            if (!destination.startsWith(storageLocation)) {
                throw new IllegalArgumentException("Invalid file path");
            }

            Files.copy(file.getInputStream(), destination);

            return storedFilename;

        } catch (IOException exception) {
            throw new IllegalStateException("Unable to store resume file", exception);
        }
    }

    public Resource loadResume(String storedFilename) {

        if (storedFilename == null
                || storedFilename.isBlank()
                || !storedFilename.matches("[a-fA-F0-9-]+\\.pdf")) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid resume filename"
            );
        }

        Path filePath = storageLocation.resolve(storedFilename).normalize();

        if (!filePath.startsWith(storageLocation)
                || !Files.isRegularFile(filePath)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Resume file not found"
            );
        }

        return new FileSystemResource(filePath);
    }
}