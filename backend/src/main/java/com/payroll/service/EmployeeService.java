package com.payroll.service;

import com.payroll.dto.EmployeeDTO;
import com.payroll.entity.Employee;
import com.payroll.entity.LeaveBalance;
import com.payroll.entity.LeaveType;
import com.payroll.entity.Role;
import com.payroll.entity.User;
import com.payroll.repository.EmployeeRepository;
import com.payroll.repository.LeaveBalanceRepository;
import com.payroll.repository.LeaveTypeRepository;
import com.payroll.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class EmployeeService {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LeaveTypeRepository leaveTypeRepository;

    @Autowired
    private LeaveBalanceRepository leaveBalanceRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<EmployeeDTO> getAllEmployees() {
        return employeeRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public EmployeeDTO getEmployeeById(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found with ID: " + id));
        return convertToDTO(employee);
    }

    @Transactional(readOnly = true)
    public EmployeeDTO getEmployeeByUsername(String username) {
        Employee employee = employeeRepository.findByUserUsername(username)
                .orElseThrow(() -> new RuntimeException("Employee not found for username: " + username));
        return convertToDTO(employee);
    }

    @Transactional
    public EmployeeDTO createEmployee(EmployeeDTO dto) {
        if (employeeRepository.existsByEmployeeCode(dto.getEmployeeCode())) {
            throw new RuntimeException("Employee Code already exists: " + dto.getEmployeeCode());
        }
        if (employeeRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Email already exists: " + dto.getEmail());
        }

        User user = null;
        // If login credentials are provided, set up the user account
        if (dto.getUsername() != null && !dto.getUsername().trim().isEmpty()) {
            if (userRepository.existsByUsername(dto.getUsername())) {
                throw new RuntimeException("Username already exists: " + dto.getUsername());
            }
            Role role = Role.EMPLOYEE;
            if (dto.getRole() != null) {
                try {
                    role = Role.valueOf(dto.getRole().toUpperCase());
                } catch (IllegalArgumentException e) {
                    // fall back to default role
                }
            }

            user = User.builder()
                    .username(dto.getUsername())
                    .password(passwordEncoder.encode(dto.getPassword() != null ? dto.getPassword() : "Welcome@123"))
                    .role(role)
                    .build();
            user = userRepository.save(user);
        }

        Employee employee = Employee.builder()
                .user(user)
                .employeeCode(dto.getEmployeeCode())
                .firstName(dto.getFirstName())
                .lastName(dto.getLastName())
                .email(dto.getEmail())
                .phone(dto.getPhone())
                .department(dto.getDepartment())
                .designation(dto.getDesignation())
                .joiningDate(dto.getJoiningDate())
                .status("ACTIVE")
                .build();

        Employee savedEmployee = employeeRepository.save(employee);

        // Auto-allocate standard leave balances for each configured leave type
        List<LeaveType> leaveTypes = leaveTypeRepository.findAll();
        for (LeaveType type : leaveTypes) {
            LeaveBalance balance = LeaveBalance.builder()
                    .employee(savedEmployee)
                    .leaveType(type)
                    .balance(type.getTotalDays())
                    .used(0)
                    .build();
            leaveBalanceRepository.save(balance);
        }

        return convertToDTO(savedEmployee);
    }

    @Transactional
    public EmployeeDTO updateEmployee(Long id, EmployeeDTO dto) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found with ID: " + id));

        // Validation for uniqueness if modified
        if (!employee.getEmployeeCode().equals(dto.getEmployeeCode()) && 
                employeeRepository.existsByEmployeeCode(dto.getEmployeeCode())) {
            throw new RuntimeException("Employee Code already exists: " + dto.getEmployeeCode());
        }
        if (!employee.getEmail().equals(dto.getEmail()) && 
                employeeRepository.existsByEmail(dto.getEmail())) {
            throw new RuntimeException("Email already exists: " + dto.getEmail());
        }

        employee.setEmployeeCode(dto.getEmployeeCode());
        employee.setFirstName(dto.getFirstName());
        employee.setLastName(dto.getLastName());
        employee.setEmail(dto.getEmail());
        employee.setPhone(dto.getPhone());
        employee.setDepartment(dto.getDepartment());
        employee.setDesignation(dto.getDesignation());
        employee.setJoiningDate(dto.getJoiningDate());
        if (dto.getStatus() != null) {
            employee.setStatus(dto.getStatus());
        }

        // If employee has a user and user details are in dto, update user role
        if (employee.getUser() != null) {
            User user = employee.getUser();
            if (dto.getRole() != null) {
                try {
                    user.setRole(Role.valueOf(dto.getRole().toUpperCase()));
                    userRepository.save(user);
                } catch (IllegalArgumentException ignored) {}
            }
        }

        Employee updatedEmployee = employeeRepository.save(employee);
        return convertToDTO(updatedEmployee);
    }

    @Transactional
    public void deleteEmployee(Long id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found with ID: " + id));
        
        User user = employee.getUser();
        employeeRepository.delete(employee);
        
        if (user != null) {
            userRepository.delete(user);
        }
    }

    public EmployeeDTO convertToDTO(Employee employee) {
        EmployeeDTO dto = new EmployeeDTO();
        dto.setId(employee.getId());
        dto.setEmployeeCode(employee.getEmployeeCode());
        dto.setFirstName(employee.getFirstName());
        dto.setLastName(employee.getLastName());
        dto.setEmail(employee.getEmail());
        dto.setPhone(employee.getPhone());
        dto.setDepartment(employee.getDepartment());
        dto.setDesignation(employee.getDesignation());
        dto.setJoiningDate(employee.getJoiningDate());
        dto.setStatus(employee.getStatus());

        if (employee.getUser() != null) {
            dto.setUserId(employee.getUser().getId());
            dto.setUsername(employee.getUser().getUsername());
            dto.setRole(employee.getUser().getRole().name());
        }
        return dto;
    }
}
