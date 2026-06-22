package com.example.AI.JobTracker.controller;

import com.example.AI.JobTracker.dtos.LoginRequest;
import com.example.AI.JobTracker.dtos.LoginResponse;
import com.example.AI.JobTracker.dtos.RegisterRequest;
import com.example.AI.JobTracker.dtos.RegisterResponse;
import com.example.AI.JobTracker.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor


public class UserController {

    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(@RequestBody RegisterRequest registerRequest){

        return ResponseEntity.ok(userService.registerUser(registerRequest));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest loginRequest){
        return ResponseEntity.ok(userService.loginUser(loginRequest));
    }
}
