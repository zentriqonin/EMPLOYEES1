package com.payroll.repository;

import com.payroll.entity.Deduction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DeductionRepository extends JpaRepository<Deduction, Long> {
    Optional<Deduction> findByPayrollId(Long payrollId);
}
