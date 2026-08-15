package com.payroll.repository;

import com.payroll.entity.Notice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NoticeRepository extends JpaRepository<Notice, Long> {
    List<Notice> findAllByIsActiveTrueOrderByCreatedAtDesc();
    List<Notice> findAllByOrderByCreatedAtDesc();
}
