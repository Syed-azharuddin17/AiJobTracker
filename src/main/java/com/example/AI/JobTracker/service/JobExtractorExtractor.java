package com.example.AI.JobTracker.service;

import com.example.AI.JobTracker.dtos.JobExtractionResult;
import dev.langchain4j.service.SystemMessage;
import dev.langchain4j.service.UserMessage;

public interface JobExtractorExtractor {

    @SystemMessage("""
        You are a structured data extractor. Analyze the provided text from a job posting webpage.
        Isolate and extract the company name, the job position title, and the full job description text.
        You must populate the fields precisely. If a field cannot be found, return an empty string.
        """)
    JobExtractionResult extract(@UserMessage String webpageContent);
}