package com.example.AI.JobTracker.dtos;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RegisterResponse {

    private Long id;
    private String email;
    private String firstName;
    private String lastName;

}
