package com.example.AI.JobTracker.service;

import com.example.AI.JobTracker.dtos.JobRequest;
import com.example.AI.JobTracker.dtos.JobResponse;
import com.example.AI.JobTracker.entity.JobApplications;
import com.example.AI.JobTracker.entity.Users;
import com.example.AI.JobTracker.repository.JobApplicationRepository;
import com.example.AI.JobTracker.repository.UserRepository;
import dev.langchain4j.model.chat.ChatLanguageModel;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import com.example.AI.JobTracker.entity.JobStatus;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JobService {

    private final UserRepository userRepository;
    private final JobApplicationRepository jobApplicationRepository;

    private final AiFeedbackService aiFeedbackService;

    private final JobApplicationRepository jobRepository;



    public JobResponse trackJob(JobRequest jobRequest){

        // 1. Pull the authenticated user's email out of Spring's security context
        String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();

        // 2. Fetch the actual user record from our database
        Users users = userRepository.findByEmail(currentUserEmail).orElseThrow(()-> new RuntimeException("Authenticated user context mismatch"));

        // Pull the user's custom resume text safely
        String userResumeText = users.getResumeText();
        if (userResumeText == null || userResumeText.isBlank()) {
            userResumeText = "[No resume uploaded yet. Analyze the job description generally.]";
        }

//        // 3. Call Gemini instantly using the injected model to analyze the description string
//        String aiGeneratedFeedback;
//        try {
//            String prompt = String.format("""
//            You are an elite corporate Recruiter and Expert Career Coach.
//            Analyze the provided Job Description against the Candidate's Resume.
//
//            Candidate Resume:
//            %s
//
//            Target Job Description:
//            %s
//
//            Deliver concise, highly actionable feedback:
//            1. MISSING KEYWORDS/SKILLS: Identify specific technical tools, concepts, or frameworks demanded by the job description that are missing from the candidate's resume.
//            2. RESUME TAILORING ADVICE: Give 2-3 bullet points on how to adjust their resume bullets to better highlight relevant experience for this specific role.
//            3. INTERVIEW PREP TIPS: Give 3 highly tailored, role-specific technical interview prep tips.
//            Keep it clean using standard markdown bullet points. Do not use markdown headers (# or ##).
//            """, userResumeText, jobRequest.getJobDescription());
//
//            aiGeneratedFeedback = chatLanguageModel.generate(prompt);
//        } catch (Exception e) {
//            aiGeneratedFeedback = "AI Feedback temporarily unavailable: " + e.getMessage();
//        }


        String aiGeneratedFeedback;
        try {
             aiGeneratedFeedback = aiFeedbackService.analyzeGaps(jobRequest.getJobDescription(), userResumeText);
        }
        catch (Exception e){
            aiGeneratedFeedback = "AI Feedback temporarily unavailable :" + e.getMessage();
        }

        // 3. Map the DTO incoming data into our database Entity model
        JobApplications jobApplications = JobApplications.builder()
                .companyName(jobRequest.getCompanyName())
                .jobTitle(jobRequest.getJobTitle())
                .jobDescription(jobRequest.getJobDescription())
                .jobStatus(com.example.AI.JobTracker.entity.JobStatus.SAVED)
                .aiFeedback(aiGeneratedFeedback)
                .users(users) // Link this job row to our user record!
                .build();

        // 4. Commit to PostgreSQL
        JobApplications savedJob = jobApplicationRepository.save(jobApplications);

        // 5. Convert back to a clean output DTO and return it
        return mapToResponse(savedJob);
    }

    public List<JobResponse> getAllMyJobs(){

        String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();

        Users users = userRepository.findByEmail(currentUserEmail).orElseThrow(()->new RuntimeException("user profile not found"));

        return jobApplicationRepository.findByUsersId(users.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());


    }

    public JobResponse updateJobStatus(Long jobId, JobStatus newStatus) {
        String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();

        JobApplications job = jobApplicationRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job application not found"));

        // Verification safety: Ensure this job belongs to the logged in user
        if (!job.getUsers().getEmail().equals(currentUserEmail)) {
            throw new org.springframework.security.access.AccessDeniedException("Unauthorized modification request");
        }

        job.setJobStatus(newStatus);
        JobApplications updatedJob = jobApplicationRepository.save(job);
        return mapToResponse(updatedJob);
    }

    @Transactional(readOnly = true)
    public Page<JobResponse> getPaginatedJobs(int page, int size) {
        // 1. Resolve current user identity via Spring Security Context
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        // 2. Set up paging boundaries with a strict descending sort order on the ID column
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());

        // 3. Query the DB chunk and map the persistent entities into clean DTO blocks
        return jobRepository.findByUsersEmail(email, pageable)
                .map(this::mapToResponse); // Reuses your existing response converter method
    }

    @Transactional(readOnly = true)
    public Map<String, Long> getDashboardMetrics() {
        // 1. Resolve current user identity via Spring Security Context
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        // 2. Fetch raw aggregate rows from our custom repository query
        List<Map<String, Object>> rawMetrics = jobRepository.getStatusCountsByUserEmail(email);

        // 3. Build a default data dictionary initializing all statuses to 0L
        Map<String, Long> metricsMap = new HashMap<>();
        for (JobStatus status : JobStatus.values()) {
            metricsMap.put(status.name(), 0L);
        }

        // 4. Map the database calculations into the tracking data dictionary profiles
        for (Map<String, Object> row : rawMetrics) {
            String statusStr = row.get("status").toString();
            Long count = (Long) row.get("count");
            metricsMap.put(statusStr, count);
        }

        return metricsMap;
    }



    private JobResponse mapToResponse(JobApplications job){

        return JobResponse.builder()
                .id(job.getId())
                .companyName(job.getCompanyName())
                .jobTitle(job.getJobTitle())
                .jobDescription(job.getJobDescription())
                .jobStatus(job.getJobStatus())
                .aiFeedback(job.getAiFeedback())
                .createdAt(job.getCreatedAt())
                .updatedAt(job.getUpdatedAt())
                .build();
    }



}
