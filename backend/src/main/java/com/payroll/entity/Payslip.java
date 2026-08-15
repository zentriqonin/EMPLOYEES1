package com.payroll.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "payslips")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payslip {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "payroll_id", nullable = false, unique = true)
    private Payroll payroll;

    @Column(name = "payslip_number", nullable = false, unique = true, length = 50)
    private String payslipNumber;

    @Lob
    @Column(name = "pdf_data", nullable = false, columnDefinition = "LONGBLOB")
    private byte[] pdfData;

    @CreationTimestamp
    @Column(name = "generated_at", nullable = false, updatable = false)
    private LocalDateTime generatedAt;
}
