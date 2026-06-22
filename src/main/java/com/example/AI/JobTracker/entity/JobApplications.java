package com.example.AI.JobTracker.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;


@Entity
@Table(name = "job_applications")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder

public class JobApplications {

   @Id
   @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long Id;

   @Column(nullable = false)
    private String companyName;

   @Column(nullable = false)
    private String jobTitle;

   @Column(columnDefinition = "TEXT")
   private String jobDescription;

   @Enumerated(EnumType.STRING)
   @Column(nullable = false)
   private JobStatus jobStatus;

   @Column(columnDefinition = "TEXT")
   private String aiFeedback;

   private LocalDateTime createdAt;
   private LocalDateTime updatedAt;

   @ManyToOne(fetch = FetchType.LAZY)
   @JoinColumn(name = "user_id",nullable = false)
   private Users users;


   @PrePersist
   protected void onCreate(){
      this.createdAt = LocalDateTime.now();
      this.updatedAt = LocalDateTime.now();

      if (this.jobStatus == null){

         this.jobStatus = JobStatus.SAVED;
      }

   }

   @PreUpdate
   protected void onUpdate() {
      this.updatedAt = LocalDateTime.now();
   }
}
