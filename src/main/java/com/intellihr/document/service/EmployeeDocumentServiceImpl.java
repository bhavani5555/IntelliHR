package com.intellihr.document.service;

import com.intellihr.document.dto.DocumentDownload;
import com.intellihr.document.dto.EmployeeDocumentResponse;
import com.intellihr.document.entity.EmployeeDocument;
import com.intellihr.document.repository.EmployeeDocumentRepository;
import com.intellihr.employee.entity.Employee;
import com.intellihr.employee.repository.EmployeeRepository;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class EmployeeDocumentServiceImpl implements EmployeeDocumentService {

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024;

    private final EmployeeDocumentRepository documentRepository;
    private final EmployeeRepository employeeRepository;
    private final Path storageDirectory;

    public EmployeeDocumentServiceImpl(
            EmployeeDocumentRepository documentRepository,
            EmployeeRepository employeeRepository,
            @Value("${app.document.storage-location}") String storageLocation
    ) {
        this.documentRepository = documentRepository;
        this.employeeRepository = employeeRepository;
        this.storageDirectory = Paths.get(storageLocation)
                .toAbsolutePath()
                .normalize();
    }

    @Override
    public EmployeeDocumentResponse uploadDocument(
            Long employeeId,
            MultipartFile file
    ) {

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Employee not found"
                ));

        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Please select a file to upload"
            );
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "File size cannot exceed 5 MB"
            );
        }

        String originalFileName = Paths.get(
                file.getOriginalFilename() == null
                        ? ""
                        : file.getOriginalFilename()
        ).getFileName().toString();

        String extension = getExtension(originalFileName);

        String contentType = switch (extension) {
            case "pdf" -> "application/pdf";
            case "jpg", "jpeg" -> "image/jpeg";
            case "png" -> "image/png";
            default -> throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Only PDF, JPG and PNG files are allowed"
            );
        };

        validateFileSignature(file, extension);

        String storedFileName = UUID.randomUUID() + "." + extension;
        Path targetPath = storageDirectory.resolve(storedFileName).normalize();

        if (!targetPath.startsWith(storageDirectory)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid file name"
            );
        }

        try {
            Files.createDirectories(storageDirectory);
            Files.copy(file.getInputStream(), targetPath);

            EmployeeDocument document = new EmployeeDocument();
            document.setEmployee(employee);
            document.setOriginalFileName(originalFileName);
            document.setStoredFileName(storedFileName);
            document.setContentType(contentType);
            document.setFileSize(file.getSize());
            document.setUploadedAt(LocalDateTime.now());

            EmployeeDocument savedDocument =
                    documentRepository.save(document);

            return mapToResponse(savedDocument);

        } catch (IOException | RuntimeException exception) {

            try {
                Files.deleteIfExists(targetPath);
            } catch (IOException ignored) {
                // Preserve the original exception.
            }

            if (exception instanceof ResponseStatusException responseException) {
                throw responseException;
            }

            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Unable to store document"
            );
        }
    }

    @Override
    public List<EmployeeDocumentResponse> getEmployeeDocuments(
            Long employeeId
    ) {

        if (!employeeRepository.existsById(employeeId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Employee not found"
            );
        }

        return documentRepository
                .findByEmployeeIdOrderByUploadedAtDesc(employeeId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public DocumentDownload downloadDocument(Long documentId) {

        EmployeeDocument document = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Document not found"
                ));

        Path filePath = storageDirectory
                .resolve(document.getStoredFileName())
                .normalize();

        if (!filePath.startsWith(storageDirectory)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid document path"
            );
        }

        Resource resource = new FileSystemResource(filePath);

        if (!resource.exists() || !resource.isReadable()) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Document file not found"
            );
        }

        return new DocumentDownload(
                resource,
                document.getOriginalFileName(),
                document.getContentType()
        );
    }

    @Override
    public void deleteDocument(Long documentId) {

        EmployeeDocument document = documentRepository.findById(documentId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Document not found"
                ));

        Path filePath = storageDirectory
                .resolve(document.getStoredFileName())
                .normalize();

        if (!filePath.startsWith(storageDirectory)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid document path"
            );
        }

        try {
            Files.deleteIfExists(filePath);
            documentRepository.delete(document);
        } catch (IOException exception) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Unable to delete document file"
            );
        }
    }

    private void validateFileSignature(
            MultipartFile file,
            String extension
    ) {

        try (InputStream inputStream = file.getInputStream()) {

            byte[] header = inputStream.readNBytes(8);

            boolean valid = switch (extension) {
                case "pdf" ->
                        header.length >= 5
                        && header[0] == '%'
                        && header[1] == 'P'
                        && header[2] == 'D'
                        && header[3] == 'F'
                        && header[4] == '-';

                case "jpg", "jpeg" ->
                        header.length >= 3
                        && (header[0] & 0xFF) == 0xFF
                        && (header[1] & 0xFF) == 0xD8
                        && (header[2] & 0xFF) == 0xFF;

                case "png" ->
                        header.length >= 8
                        && (header[0] & 0xFF) == 0x89
                        && header[1] == 'P'
                        && header[2] == 'N'
                        && header[3] == 'G'
                        && (header[4] & 0xFF) == 0x0D
                        && (header[5] & 0xFF) == 0x0A
                        && (header[6] & 0xFF) == 0x1A
                        && (header[7] & 0xFF) == 0x0A;

                default -> false;
            };

            if (!valid) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "File content does not match its extension"
                );
            }

        } catch (IOException exception) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Unable to read uploaded file"
            );
        }
    }

    private String getExtension(String fileName) {

        int dotIndex = fileName.lastIndexOf('.');

        if (dotIndex < 0 || dotIndex == fileName.length() - 1) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "File extension is required"
            );
        }

        return fileName.substring(dotIndex + 1).toLowerCase();
    }

    private EmployeeDocumentResponse mapToResponse(
            EmployeeDocument document
    ) {

        return new EmployeeDocumentResponse(
                document.getId(),
                document.getEmployee().getId(),
                document.getOriginalFileName(),
                document.getContentType(),
                document.getFileSize(),
                document.getUploadedAt()
        );
    }
}
