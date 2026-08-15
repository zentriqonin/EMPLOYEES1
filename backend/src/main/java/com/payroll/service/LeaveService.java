package com.payroll.service;

import com.payroll.dto.LeaveApprovalRequest;
import com.payroll.dto.LeaveRequestDTO;
import com.payroll.entity.*;
import com.payroll.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LeaveService {

    @Autowired
    private LeaveRequestRepository leaveRequestRepository;

    @Autowired
    private LeaveBalanceRepository leaveBalanceRepository;

    @Autowired
    private LeaveTypeRepository leaveTypeRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Transactional(readOnly = true)
    public List<LeaveBalance> getLeaveBalances(Long employeeId) {
        return leaveBalanceRepository.findByEmployeeId(employeeId);
    }

    @Transactional(readOnly = true)
    public List<LeaveRequestDTO> getLeaveHistory(Long employeeId) {
        return leaveRequestRepository.findByEmployeeId(employeeId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<LeaveRequestDTO> getPendingLeaveRequests() {
        return leaveRequestRepository.findByStatus("PENDING").stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<LeaveRequestDTO> getAllLeaveRequests() {
        return leaveRequestRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public LeaveRequestDTO applyLeave(LeaveRequestDTO dto) {
        Employee employee = employeeRepository.findById(dto.getEmployeeId())
                .orElseThrow(() -> new RuntimeException("Employee not found with ID: " + dto.getEmployeeId()));

        LeaveType leaveType = leaveTypeRepository.findById(dto.getLeaveTypeId())
                .orElseThrow(() -> new RuntimeException("Leave Type not found with ID: " + dto.getLeaveTypeId()));

        if (dto.getStartDate().isAfter(dto.getEndDate())) {
            throw new RuntimeException("Start date cannot be after end date.");
        }

        // Calculate requested days
        long requestedDays = ChronoUnit.DAYS.between(dto.getStartDate(), dto.getEndDate()) + 1;

        // Check leave balance
        LeaveBalance balance = leaveBalanceRepository.findByEmployeeIdAndLeaveTypeId(employee.getId(), leaveType.getId())
                .orElseThrow(() -> new RuntimeException("Leave balance record not found for this type."));

        if (balance.getBalance() < requestedDays) {
            throw new RuntimeException("Insufficient leave balance! Requested: " + requestedDays + " days, Available: " + balance.getBalance() + " days.");
        }

        LeaveRequest request = LeaveRequest.builder()
                .employee(employee)
                .leaveType(leaveType)
                .startDate(dto.getStartDate())
                .endDate(dto.getEndDate())
                .reason(dto.getReason())
                .status("PENDING")
                .build();

        LeaveRequest saved = leaveRequestRepository.save(request);
        return convertToDTO(saved);
    }

    @Transactional
    public LeaveRequestDTO approveOrRejectLeave(Long requestId, LeaveApprovalRequest approval) {
        LeaveRequest request = leaveRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Leave request not found with ID: " + requestId));

        if (!request.getStatus().equals("PENDING")) {
            throw new RuntimeException("This leave request is already processed: " + request.getStatus());
        }

        Employee approver = employeeRepository.findById(approval.getApprovedBy())
                .orElseThrow(() -> new RuntimeException("Approver employee not found with ID: " + approval.getApprovedBy()));

        String status = approval.getStatus().toUpperCase();
        if (!status.equals("APPROVED") && !status.equals("REJECTED")) {
            throw new RuntimeException("Invalid approval status. Must be APPROVED or REJECTED.");
        }

        request.setStatus(status);
        request.setApprovedBy(approver);
        request.setRemarks(approval.getRemarks());

        if (status.equals("APPROVED")) {
            long days = ChronoUnit.DAYS.between(request.getStartDate(), request.getEndDate()) + 1;

            // 1. Deduct leave balance
            LeaveBalance balance = leaveBalanceRepository.findByEmployeeIdAndLeaveTypeId(
                    request.getEmployee().getId(), request.getLeaveType().getId())
                    .orElseThrow(() -> new RuntimeException("Leave balance not found for deduction."));

            if (balance.getBalance() < days) {
                throw new RuntimeException("Insufficient leave balance at approval time! Required: " + days + " days.");
            }

            balance.setBalance(balance.getBalance() - (int) days);
            balance.setUsed(balance.getUsed() + (int) days);
            leaveBalanceRepository.save(balance);

            // 2. Mark attendance as "LEAVE" for the entire date range
            for (LocalDate date = request.getStartDate(); !date.isAfter(request.getEndDate()); date = date.plusDays(1)) {
                Attendance attendance = attendanceRepository.findByEmployeeIdAndDate(request.getEmployee().getId(), date)
                        .orElse(new Attendance());
                
                attendance.setEmployee(request.getEmployee());
                attendance.setDate(date);
                attendance.setStatus("LEAVE");
                attendanceRepository.save(attendance);
            }
        }

        LeaveRequest updated = leaveRequestRepository.save(request);
        return convertToDTO(updated);
    }

    // Initialize Default Leave Types if table is empty
    @Transactional
    public void initDefaultLeaveTypes() {
        if (leaveTypeRepository.count() == 0) {
            leaveTypeRepository.save(LeaveType.builder().name("Sick Leave").code("SL").description("For medical use").totalDays(12).build());
            leaveTypeRepository.save(LeaveType.builder().name("Casual Leave").code("CL").description("For personal issues").totalDays(12).build());
            leaveTypeRepository.save(LeaveType.builder().name("Earned Leave").code("EL").description("Privilege leaves").totalDays(18).build());
        }
    }

    @Transactional(readOnly = true)
    public List<LeaveType> getAllLeaveTypes() {
        return leaveTypeRepository.findAll();
    }

    @Transactional
    public LeaveType createLeaveType(LeaveType type) {
        if (leaveTypeRepository.findByCode(type.getCode()).isPresent()) {
            throw new RuntimeException("Leave Type code already exists: " + type.getCode());
        }
        return leaveTypeRepository.save(type);
    }

    private LeaveRequestDTO convertToDTO(LeaveRequest req) {
        return new LeaveRequestDTO(
                req.getId(),
                req.getEmployee().getId(),
                req.getEmployee().getFirstName() + " " + req.getEmployee().getLastName(),
                req.getLeaveType().getId(),
                req.getLeaveType().getCode(),
                req.getLeaveType().getName(),
                req.getStartDate(),
                req.getEndDate(),
                req.getReason(),
                req.getStatus(),
                req.getApprovedBy() != null ? req.getApprovedBy().getId() : null,
                req.getApprovedBy() != null ? (req.getApprovedBy().getFirstName() + " " + req.getApprovedBy().getLastName()) : null,
                req.getRemarks()
        );
    }
}
