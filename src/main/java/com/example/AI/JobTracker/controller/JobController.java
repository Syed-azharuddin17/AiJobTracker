package com.example.AI.JobTracker.controller;

import com.example.AI.JobTracker.dtos.JobExtractionResult;
import com.example.AI.JobTracker.dtos.JobRequest;
import com.example.AI.JobTracker.dtos.JobResponse;
import com.example.AI.JobTracker.service.JobIngestionService;
import com.example.AI.JobTracker.service.JobService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.AI.JobTracker.entity.JobStatus;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor


public class JobController {

    private final JobService jobService;
    private final JobIngestionService ingestionService;


    @PostMapping
    public ResponseEntity<JobResponse> createJobs(@RequestBody JobRequest jobRequest) {

        JobResponse createJob = jobService.trackJob(jobRequest);

        return new ResponseEntity<>(createJob, HttpStatus.CREATED);

    }

    @GetMapping("/all")
    public ResponseEntity<List<JobResponse>> getAllMyJobs() {
        List<JobResponse> getAllJobs = jobService.getAllMyJobs();
        return ResponseEntity.ok(getAllJobs);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<JobResponse> updateStatus(
            @PathVariable Long id,
            @RequestParam JobStatus status) {
        return ResponseEntity.ok(jobService.updateJobStatus(id, status));
    }


    @GetMapping
    public ResponseEntity<Page<JobResponse>> getAllJobsPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Page<JobResponse> paginatedData = jobService.getPaginatedJobs(page, size);
        return ResponseEntity.ok(paginatedData);
    }

    // Paste this endpoint inside your JobController class body
    @GetMapping("/dashboard/stats")
    public ResponseEntity<Map<String, Long>> getStats() {
        return ResponseEntity.ok(jobService.getDashboardMetrics());
    }


    @GetMapping("/scrape")
    public ResponseEntity<JobExtractionResult> autoPopulateJob(@RequestParam String url) {
        // Call the service method we updated for LangChain4j
        JobExtractionResult extractedData = ingestionService.scrapeAndExtract(url);
        return ResponseEntity.ok(extractedData);
    }
}
