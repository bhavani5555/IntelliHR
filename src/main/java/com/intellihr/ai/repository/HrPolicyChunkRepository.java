package com.intellihr.ai.repository;

import com.intellihr.ai.entity.HrPolicyChunk;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HrPolicyChunkRepository
        extends JpaRepository<HrPolicyChunk, Long> {

    List<HrPolicyChunk> findByPolicyDocumentIdOrderByChunkIndexAsc(
            Long policyDocumentId
    );

    void deleteByPolicyDocumentId(Long policyDocumentId);
}
