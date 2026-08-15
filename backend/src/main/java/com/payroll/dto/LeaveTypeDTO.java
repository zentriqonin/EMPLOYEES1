package com.payroll.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LeaveTypeDTO {
    private Long id;

    @NotBlank(message = "Leave type name is required")
    private String name;

    @NotBlank(message = "Leave type code is required")
    private String code;

    private String description;

    @NotNull(message = "Total allowed days is required")
    private Integer totalDays;
}
