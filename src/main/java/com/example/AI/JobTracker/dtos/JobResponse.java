package com.example.AI.JobTracker.dtos;

import com.example.AI.JobTracker.entity.JobStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder

public class JobResponse {

    private Long id;
    private String companyName;
    private String jobTitle;
    private String jobDescription;
    private JobStatus jobStatus;
    private String aiFeedback;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
