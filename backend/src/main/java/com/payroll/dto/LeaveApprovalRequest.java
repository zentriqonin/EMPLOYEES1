package com.payroll.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LeaveApprovalRequest {
    @NotBlank(message = "Status is required")
    private String status; // APPROVED, REJECTED

    private String remarks;

    @NotNull(message = "Approver Employee ID is required")
    private Long approvedBy; // HR/Admin employee ID
}
