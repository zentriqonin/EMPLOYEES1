package com.payroll.service;

import com.payroll.dto.AttendanceDTO;
import com.payroll.entity.Attendance;
import com.payroll.entity.Employee;
import com.payroll.repository.AttendanceRepository;
import com.payroll.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AttendanceService {

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Transactional(readOnly = true)
    public List<AttendanceDTO> getAttendanceHistory(Long employeeId, LocalDate startDate, LocalDate endDate) {
        return attendanceRepository.findByEmployeeIdAndDateBetween(employeeId, startDate, endDate).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AttendanceDTO> getAttendanceForDate(LocalDate date) {
        return attendanceRepository.findByDate(date).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public AttendanceDTO markAttendance(AttendanceDTO dto) {
        Employee employee = employeeRepository.findById(dto.getEmployeeId())
                .orElseThrow(() -> new RuntimeException("Employee not found with ID: " + dto.getEmployeeId()));

        Attendance attendance = attendanceRepository.findByEmployeeIdAndDate(dto.getEmployeeId(), dto.getDate())
                .orElse(new Attendance());

        attendance.setEmployee(employee);
        attendance.setDate(dto.getDate());
        attendance.setStatus(dto.getStatus());
        attendance.setCheckInTime(dto.getCheckInTime());
        attendance.setCheckOutTime(dto.getCheckOutTime());

        Attendance saved = attendanceRepository.save(attendance);
        return convertToDTO(saved);
    }

    public AttendanceDTO convertToDTO(Attendance att) {
        return new AttendanceDTO(
                att.getId(),
                att.getEmployee().getId(),
                att.getEmployee().getEmployeeCode(),
                att.getEmployee().getFirstName() + " " + att.getEmployee().getLastName(),
                att.getDate(),
                att.getStatus(),
                att.getCheckInTime(),
                att.getCheckOutTime()
        );
    }
}
