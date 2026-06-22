package com.example.AI.JobTracker.controller;

import com.example.AI.JobTracker.entity.Users;
import com.example.AI.JobTracker.repository.UserRepository;
import com.example.AI.JobTracker.service.ResumeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Optional;

@RestController
@RequestMapping("/api/resume")
@RequiredArgsConstructor


public class ResumeController {

    private final ResumeService resumeService;

    private final UserRepository userRepository;

    @PostMapping("/upload")
    public ResponseEntity<String> uploadResume(@RequestParam("file") MultipartFile file) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        String response = resumeService.uploadAndParseResume(email, file);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/profile")
    public ResponseEntity<String> getUserResume(){
        String userEmail = SecurityContextHolder.getContext().getAuthentication().getName();

        Users users = userRepository.findByEmail(userEmail).orElseThrow(()-> new RuntimeException("Aunthenticated user context not found"));

        if (users.getResumeText() == null || users.getResumeText().isEmpty()){
            return ResponseEntity.ok("Resume not found");


        }

        return ResponseEntity.ok(users.getResumeText());
    }

    @PostMapping("/tailor/{jobId}")
    public ResponseEntity<String> getTailoredResume(@PathVariable Long jobId) {
        String tailoredResumeMarkdown = resumeService.generateTailoredResume(jobId);
        return ResponseEntity.ok(tailoredResumeMarkdown);
    }
}
