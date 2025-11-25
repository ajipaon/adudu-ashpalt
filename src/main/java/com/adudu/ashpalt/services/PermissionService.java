package com.adudu.ashpalt.services;

import com.adudu.ashpalt.models.Permission;
import com.adudu.ashpalt.repository.PermissionRepository;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

@Service
public class PermissionService {

    private final PermissionRepository permissionRepository;

    public PermissionService(PermissionRepository permissionRepository) {
        this.permissionRepository = permissionRepository;

    }

    public Permission findById(Long id) {
        return Objects.requireNonNull(permissionRepository.findById(id).orElse(null));
    }

    public Set<Permission> getAllPermissions() {
        return new HashSet<>(permissionRepository.findAll());
    }

}
