package com.example.AI.JobTracker.config;

import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.googleai.GoogleAiGeminiChatModel;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Duration;

@Configuration
public class LangChainConfig {

    // This pulls your secret AIza key straight from your application.properties file
    @Value("${gemini.api.key}")
    private String apiKey;

    @Bean
    public ChatLanguageModel chatLanguageModel() {
        return GoogleAiGeminiChatModel.builder()
                .apiKey(apiKey)
                .modelName("gemini-3.1-flash-lite") // Use the blazing fast Flash model
                .timeout(Duration.ofSeconds(15)) // Max time to wait for a response
                .maxRetries(3) // If a 503 or network blip happens, it tries again up to 3 times automatically
                .build();
    }
}
