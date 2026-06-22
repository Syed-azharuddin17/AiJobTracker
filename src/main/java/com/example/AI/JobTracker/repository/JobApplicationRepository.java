package com.example.AI.JobTracker.repository;

import com.example.AI.JobTracker.entity.JobApplications;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplications,Long> {

   List<JobApplications> findByUsersId(Long userId);

   Page<JobApplications> findByUsersEmail(String email, Pageable pageable);

   @Query("SELECT j.jobStatus as status, COUNT(j) as count FROM JobApplications j WHERE j.users.email = :email GROUP BY j.jobStatus")
   List<Map<String, Object>> getStatusCountsByUserEmail(@Param("email") String email);
}
