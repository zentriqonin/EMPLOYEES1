package com.payroll.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceDTO {
    private Long id;

    @NotNull(message = "Employee ID is required")
    private Long employeeId;

    private String employeeCode;
    private String employeeName;

    @NotNull(message = "Date is required")
    private LocalDate date;

    @NotBlank(message = "Status is required")
    private String status; // PRESENT, ABSENT, LEAVE, HALF_DAY

    private LocalTime checkInTime;
    private LocalTime checkOutTime;
}
