package com.payroll.service;

import com.payroll.dto.NoticeDTO;
import com.payroll.entity.Notice;
import com.payroll.entity.User;
import com.payroll.repository.NoticeRepository;
import com.payroll.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NoticeService {

    @Autowired
    private NoticeRepository noticeRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<NoticeDTO> getActiveNotices() {
        return noticeRepository.findAllByIsActiveTrueOrderByCreatedAtDesc().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<NoticeDTO> getAllNotices() {
        return noticeRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public NoticeDTO getNoticeById(Long id) {
        Notice notice = noticeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notice not found with ID: " + id));
        return convertToDTO(notice);
    }

    @Transactional
    public NoticeDTO createNotice(NoticeDTO dto, User creator) {
        Notice notice = Notice.builder()
                .title(dto.getTitle())
                .content(dto.getContent())
                .createdBy(creator)
                .isActive(dto.isActive())
                .build();
        notice = noticeRepository.save(notice);
        return convertToDTO(notice);
    }

    @Transactional
    public NoticeDTO updateNotice(Long id, NoticeDTO dto) {
        Notice notice = noticeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notice not found with ID: " + id));
        
        notice.setTitle(dto.getTitle());
        notice.setContent(dto.getContent());
        notice.setActive(dto.isActive());
        
        notice = noticeRepository.save(notice);
        return convertToDTO(notice);
    }

    @Transactional
    public void deleteNotice(Long id) {
        Notice notice = noticeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notice not found with ID: " + id));
        noticeRepository.delete(notice);
    }

    private NoticeDTO convertToDTO(Notice notice) {
        return NoticeDTO.builder()
                .id(notice.getId())
                .title(notice.getTitle())
                .content(notice.getContent())
                .createdByUserId(notice.getCreatedBy() != null ? notice.getCreatedBy().getId() : null)
                .createdByUsername(notice.getCreatedBy() != null ? notice.getCreatedBy().getUsername() : null)
                .createdByRole(notice.getCreatedBy() != null ? notice.getCreatedBy().getRole().name() : null)
                .isActive(notice.isActive())
                .createdAt(notice.getCreatedAt())
                .updatedAt(notice.getUpdatedAt())
                .build();
    }
}
