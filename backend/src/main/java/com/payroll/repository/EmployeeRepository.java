package com.payroll.repository;

import com.payroll.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    Optional<Employee> findByEmployeeCode(String employeeCode);
    Optional<Employee> findByUserUsername(String username);
    Optional<Employee> findByEmail(String email);
    boolean existsByEmployeeCode(String employeeCode);
    boolean existsByEmail(String email);
}
