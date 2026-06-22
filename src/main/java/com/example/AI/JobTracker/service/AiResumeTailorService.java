package com.example.AI.JobTracker.service;

import dev.langchain4j.service.SystemMessage;
import dev.langchain4j.service.UserMessage;
import dev.langchain4j.service.V;
import dev.langchain4j.service.spring.AiService;

@AiService
public interface AiResumeTailorService {

    @SystemMessage("""
        You are an elite, professional technical resume writer. 
        Below is a candidate's original resume text and a specific target corporate job description.
        
        ORIGINAL RESUME DATA:
        {{resume}}
        
        TARGET CORPORATE JOB DESCRIPTION EXPECTATIONS:
        {{jobDescription}}
        
        CRITICAL REWRITE DIRECTIONS:
        Generate a completely new, fully optimized resume tailored specifically for this target position.
        - Naturally weave the missing tools, systems architecture, and technical frameworks required by the job description directly into the candidate's existing experience nodes.
        - Do NOT invent fake corporate brand names or fake degrees, but do strategically rewrite their actual accomplishments, project architectures, and skills matrices to reflect peak relevance.
        - Output the final result in clean, professional Markdown text. 
        - Start directly with the candidate's name at the very top. Do NOT include any introductory conversational fluff, greetings, or notes.
    """)
    String tailor(@UserMessage  @V("jobDescription") String jobDescription, @V("resume") String resumeText);



}
