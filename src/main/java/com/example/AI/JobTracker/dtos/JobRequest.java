package com.example.AI.JobTracker.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor

public class JobRequest {

    private String companyName;
    private String jobTitle;
    private String jobDescription;

}
