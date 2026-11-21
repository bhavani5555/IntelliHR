package com.intellihr.ai.dto;

import java.util.List;

public record HrPolicySourceReference(
        String fileName,
        List<Integer> chunkIndexes
) {}