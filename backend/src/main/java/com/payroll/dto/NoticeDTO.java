package com.payroll.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NoticeDTO {
    private Long id;

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Content is required")
    private String content;

    private Long createdByUserId;
    private String createdByUsername;
    private String createdByRole;

    @Builder.Default
    private boolean isActive = true;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
