package com.intellihr.ai.repository;

import com.intellihr.ai.entity.HrPolicyDocument;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface HrPolicyDocumentRepository
        extends JpaRepository<HrPolicyDocument, Long> {

    Optional<HrPolicyDocument> findByOriginalFileNameIgnoreCase(
            String originalFileName
    );
}
