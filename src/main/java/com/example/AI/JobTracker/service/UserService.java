package com.example.AI.JobTracker.service;

import com.example.AI.JobTracker.dtos.LoginRequest;
import com.example.AI.JobTracker.dtos.LoginResponse;
import com.example.AI.JobTracker.dtos.RegisterRequest;
import com.example.AI.JobTracker.dtos.RegisterResponse;
import com.example.AI.JobTracker.entity.Users;
import com.example.AI.JobTracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PostMapping;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;


// --- registration logic ---//


    public RegisterResponse registerUser(RegisterRequest registerRequest){

        // check if email is already registered

        if(userRepository.findByEmail(registerRequest.getEmail()).isPresent()){
            throw new RuntimeException("Email is already in use");
        }

        // build user entity and hash the password

        Users users = Users.builder()
                .email(registerRequest.getEmail())
                .password(passwordEncoder.encode(registerRequest.getPassword()))
                .firstName(registerRequest.getFirstName())
                .lastName(registerRequest.getLastName())
                .role("ROLE_USER")
                .build();

        // Save to db

        Users savedUser = userRepository.save(users);

        // return the safe response

        return RegisterResponse.builder()
                .id(savedUser.getId())
                .email(savedUser.getEmail())
                .firstName(savedUser.getFirstName())
                .lastName(savedUser.getLastName())
                .build();

    }


    // --- LOGIN LOGIC --- //

    public LoginResponse loginUser(LoginRequest loginRequest){

        Users userInfo = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(()->new RuntimeException("Incorrect email or password"));

        if (!passwordEncoder.matches(loginRequest.getPassword(), userInfo.getPassword())){
            throw new RuntimeException("Invalid email or password");
        }


        String token = jwtService.generateToken(userInfo.getEmail());

        return LoginResponse.builder()
                .token(token)
                .response(RegisterResponse.builder()
                        .id(userInfo.getId())
                        .email(userInfo.getEmail())
                        .firstName(userInfo.getFirstName())
                        .lastName(userInfo.getLastName())
                        .build()).build();
    }



}
