package com.adudu.ashpalt.repository;

import com.adudu.ashpalt.models.Permission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PermissionRepository extends JpaRepository<Permission, Long>, JpaSpecificationExecutor<Permission> {

    Optional<Permission> findById(Long id);

    Optional<Permission> findByName(String name);

    List<Permission> findByResourceType(String resourceType);
}
