package com.example.AI.JobTracker.service;

import com.example.AI.JobTracker.dtos.JobExtractionResult;
import com.fasterxml.jackson.databind.ObjectMapper;
import dev.langchain4j.model.googleai.GoogleAiGeminiChatModel;
import dev.langchain4j.service.AiServices;
import jakarta.annotation.PostConstruct;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JobIngestionService {

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    private JobExtractorExtractor aiExtractor;

    @PostConstruct
    public void init() {
        // Initialize Gemini model via LangChain4j
        GoogleAiGeminiChatModel model = GoogleAiGeminiChatModel.builder()
                .apiKey(geminiApiKey)
                .modelName("gemini-3.1-flash-lite") // High-speed processing model
                .temperature(0.1)             // Keep it deterministic for extraction accuracy
                .build();

        // Build the proxy implementation of our interface
        this.aiExtractor = AiServices.builder(JobExtractorExtractor.class)
                .chatLanguageModel(model)
                .build();
    }

    public JobExtractionResult scrapeAndExtract(String url) {
        try {
            // Scrape webpage text using Jsoup
            Document doc = Jsoup.connect(url)
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
                    .timeout(10000)
                    .get();

            String cleanTextDump = doc.body().text();

            // Run data through our automated AI Service interface
            return aiExtractor.extract(cleanTextDump);

        } catch (Exception e) {
            throw new RuntimeException("Failed to read text from URL or extract fields: " + e.getMessage());
        }
    }
}