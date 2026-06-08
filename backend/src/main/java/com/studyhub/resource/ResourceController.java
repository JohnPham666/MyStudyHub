package com.studyhub.resource;

import com.studyhub.resource.dto.ResourceDto;
import com.studyhub.resource.dto.ResourceRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/resources")
@RequiredArgsConstructor
public class ResourceController {

    private final ResourceService resourceService;

    @GetMapping
    public ResponseEntity<List<ResourceDto>> getResources() {
        return ResponseEntity.ok(resourceService.getResources());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResourceDto> getResource(@PathVariable Long id) {
        return ResponseEntity.ok(resourceService.getResource(id));
    }

    @PostMapping
    public ResponseEntity<ResourceDto> createResource(@RequestBody ResourceRequest request) {
        return ResponseEntity.ok(resourceService.createResource(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ResourceDto> updateResource(@PathVariable Long id, @RequestBody ResourceRequest request) {
        return ResponseEntity.ok(resourceService.updateResource(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResource(@PathVariable Long id) {
        resourceService.deleteResource(id);
        return ResponseEntity.noContent().build();
    }
}
