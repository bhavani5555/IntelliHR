package com.intellihr.document.repository;

import com.intellihr.document.entity.EmployeeDocument;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface EmployeeDocumentRepository
        extends JpaRepository<EmployeeDocument, Long> {

    List<EmployeeDocument> findByEmployeeIdOrderByUploadedAtDesc(Long employeeId);

    Optional<EmployeeDocument> findByIdAndEmployeeId(
            Long documentId,
            Long employeeId
    );

    boolean existsByIdAndEmployee_EmailIgnoreCase(
            Long documentId,
            String email
    );
}
