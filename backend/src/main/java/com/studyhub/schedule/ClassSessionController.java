package com.studyhub.schedule;

import com.studyhub.schedule.dto.ClassSessionDto;
import com.studyhub.schedule.dto.ClassSessionRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/schedule")
@RequiredArgsConstructor
public class ClassSessionController {

    private final ClassSessionService classSessionService;

    @GetMapping
    public ResponseEntity<List<ClassSessionDto>> getSessions() {
        return ResponseEntity.ok(classSessionService.getSessions());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClassSessionDto> getSession(@PathVariable Long id) {
        return ResponseEntity.ok(classSessionService.getSession(id));
    }

    @PostMapping
    public ResponseEntity<ClassSessionDto> createSession(@RequestBody ClassSessionRequest request) {
        return ResponseEntity.ok(classSessionService.createSession(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClassSessionDto> updateSession(@PathVariable Long id, @RequestBody ClassSessionRequest request) {
        return ResponseEntity.ok(classSessionService.updateSession(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSession(@PathVariable Long id) {
        classSessionService.deleteSession(id);
        return ResponseEntity.noContent().build();
    }
}
