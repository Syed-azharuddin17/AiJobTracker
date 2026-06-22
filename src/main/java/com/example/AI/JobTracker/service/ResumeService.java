package com.example.AI.JobTracker.service;

import com.example.AI.JobTracker.entity.JobApplications;
import com.example.AI.JobTracker.entity.Users;
import com.example.AI.JobTracker.repository.JobApplicationRepository;
import com.example.AI.JobTracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.apache.tika.Tika;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class ResumeService {

    private final UserRepository userRepository;
    private final Tika tika = new Tika(); // Instantiates your Tika extraction tool
    private final AiResumeTailorService aiResumeTailorService;
    private final JobApplicationRepository jobRepository;

    @Transactional
    public String uploadAndParseResume(String email, MultipartFile file) {
        Users user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User context not found"));

        try {
            // Tika detects file type automatically and extracts raw string content
            String extractedText = tika.parseToString(file.getInputStream());

            // 🚨 Add this console print statement right here to debug!
            System.out.println("======= TIKA EXTRACTED TEXT START =======");
            System.out.println("Length: " + (extractedText != null ? extractedText.length() : "NULL"));
            System.out.println("Content: " + extractedText);
            System.out.println("======= TIKA EXTRACTED TEXT END =======");

            user.setResumeText(extractedText);
            // 3. Change save() to saveAndFlush() if using JpaRepository
            // This forces Hibernate to write to Postgres immediately instead of caching it
            userRepository.saveAndFlush(user);

            return "Resume processed and saved successfully!";
        } catch (Exception e) {
            throw new RuntimeException("Failed to extract text from resume file: " + e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public String generateTailoredResume(Long jobId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        Users user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Authenticated user context not found"));

        JobApplications job = jobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Tracked job record not found with ID: " + jobId));

        if (user.getResumeText() == null || user.getResumeText().isBlank()) {
            throw new IllegalStateException("Please upload a base resume before attempting to tailor.");
        }

        // 🚨 Simple, readable, single line execution call!
        return aiResumeTailorService.tailor(job.getJobDescription(), user.getResumeText());
    }
}
