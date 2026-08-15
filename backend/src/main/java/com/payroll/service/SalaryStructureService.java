package com.payroll.service;

import com.payroll.dto.SalaryStructureDTO;
import com.payroll.entity.Employee;
import com.payroll.entity.SalaryStructure;
import com.payroll.repository.EmployeeRepository;
import com.payroll.repository.SalaryStructureRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SalaryStructureService {

    @Autowired
    private SalaryStructureRepository salaryStructureRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    @Transactional(readOnly = true)
    public SalaryStructureDTO getSalaryStructureByEmployeeId(Long employeeId) {
        return salaryStructureRepository.findByEmployeeId(employeeId)
                .map(this::convertToDTO)
                .orElseGet(() -> {
                    // Return a default structure with zeroed amounts for new configuration
                    SalaryStructureDTO dto = new SalaryStructureDTO();
                    dto.setEmployeeId(employeeId);
                    return dto;
                });
    }

    @Transactional
    public SalaryStructureDTO saveSalaryStructure(SalaryStructureDTO dto) {
        Employee employee = employeeRepository.findById(dto.getEmployeeId())
                .orElseThrow(() -> new RuntimeException("Employee not found with ID: " + dto.getEmployeeId()));

        SalaryStructure structure = salaryStructureRepository.findByEmployeeId(dto.getEmployeeId())
                .orElse(new SalaryStructure());

        structure.setEmployee(employee);
        structure.setBasicSalary(dto.getBasicSalary());
        structure.setHra(dto.getHra());
        structure.setDa(dto.getDa());
        structure.setConveyance(dto.getConveyance());
        structure.setMedical(dto.getMedical());
        structure.setOtherAllowances(dto.getOtherAllowances());
        structure.setPf(dto.getPf());
        structure.setProfessionalTax(dto.getProfessionalTax());
        structure.setIncomeTax(dto.getIncomeTax());
        structure.setLoanEmi(dto.getLoanEmi());

        SalaryStructure savedStructure = salaryStructureRepository.save(structure);
        return convertToDTO(savedStructure);
    }

    private SalaryStructureDTO convertToDTO(SalaryStructure s) {
        return new SalaryStructureDTO(
                s.getId(),
                s.getEmployee().getId(),
                s.getBasicSalary(),
                s.getHra(),
                s.getDa(),
                s.getConveyance(),
                s.getMedical(),
                s.getOtherAllowances(),
                s.getPf(),
                s.getProfessionalTax(),
                s.getIncomeTax(),
                s.getLoanEmi()
        );
    }
}
