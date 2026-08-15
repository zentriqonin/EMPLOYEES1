package com.payroll.repository;

import com.payroll.entity.Payslip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PayslipRepository extends JpaRepository<Payslip, Long> {
    Optional<Payslip> findByPayrollId(Long payrollId);

    @Query("SELECT p FROM Payslip p JOIN FETCH p.payroll WHERE p.employee.id = :employeeId")
    List<Payslip> findByEmployeeId(@Param("employeeId") Long employeeId);
}
