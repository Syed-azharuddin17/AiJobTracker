package com.example.AI.JobTracker.service;

import dev.langchain4j.service.SystemMessage;
import dev.langchain4j.service.UserMessage;
import dev.langchain4j.service.V;
import dev.langchain4j.service.spring.AiService;

@AiService // Registers this interface directly as an injectable Spring Bean!
public interface AiFeedbackService {

    @SystemMessage("""
    You are an elite corporate Recruiter and Expert Career Coach.
    Analyze the provided Job Description against the Candidate's Resume.
    
    Candidate Resume:
    {{resume}}
    
    Deliver concise, highly actionable feedback based on the above resume:
    1. MISSING KEYWORDS/SKILLS: Identify specific technical tools or frameworks missing.
    2. RESUME TAILORING ADVICE: Give 2-3 bullet points on how to adjust their bullets.
    3. INTERVIEW PREP TIPS: Give 3 highly tailored technical interview prep tips.
    Keep it clean using standard markdown bullet points. Do not use markdown headers (# or ##).
""")

    String analyzeGaps(@UserMessage String jobDescription, @V("resume") String resumeText);
}
