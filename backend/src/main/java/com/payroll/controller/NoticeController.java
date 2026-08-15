package com.payroll.controller;

import com.payroll.dto.NoticeDTO;
import com.payroll.security.UserPrincipal;
import com.payroll.service.NoticeService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notices")
public class NoticeController {

    @Autowired
    private NoticeService noticeService;

    @GetMapping
    public ResponseEntity<List<NoticeDTO>> getActiveNotices() {
        return ResponseEntity.ok(noticeService.getActiveNotices());
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    public ResponseEntity<List<NoticeDTO>> getAllNotices() {
        return ResponseEntity.ok(noticeService.getAllNotices());
    }

    @GetMapping("/{id}")
    public ResponseEntity<NoticeDTO> getNoticeById(@PathVariable Long id) {
        return ResponseEntity.ok(noticeService.getNoticeById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    public ResponseEntity<NoticeDTO> createNotice(@Valid @RequestBody NoticeDTO dto, @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(noticeService.createNotice(dto, principal.getUser()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    public ResponseEntity<NoticeDTO> updateNotice(@PathVariable Long id, @Valid @RequestBody NoticeDTO dto) {
        return ResponseEntity.ok(noticeService.updateNotice(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    public ResponseEntity<Void> deleteNotice(@PathVariable Long id) {
        noticeService.deleteNotice(id);
        return ResponseEntity.ok().build();
    }
}
