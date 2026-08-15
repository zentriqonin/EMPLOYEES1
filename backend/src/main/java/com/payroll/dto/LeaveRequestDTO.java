package com.payroll.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LeaveRequestDTO {
    private Long id;

    @NotNull(message = "Employee ID is required")
    private Long employeeId;
    private String employeeName;

    @NotNull(message = "Leave Type ID is required")
    private Long leaveTypeId;
    private String leaveTypeCode;
    private String leaveTypeName;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "End date is required")
    private LocalDate endDate;

    @NotBlank(message = "Reason is required")
    private String reason;

    private String status; // PENDING, APPROVED, REJECTED
    private Long approvedBy;
    private String approvedByName;
    private String remarks;
}
