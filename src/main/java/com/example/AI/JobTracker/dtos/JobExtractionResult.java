package com.example.AI.JobTracker.dtos;

public record JobExtractionResult(
        String companyName,
        String jobTitle,
        String jobDescription
) {}