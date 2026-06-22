package com.example.AI.JobTracker.dtos;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LoginResponse {
    private String token;
    private RegisterResponse response;
}
