package com.adudu.ashpalt.repository;

import com.adudu.ashpalt.models.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RolesRepository  extends JpaRepository<Role, Long>, JpaSpecificationExecutor<Role> {

    Optional<Role> findById(Long id);

    Optional<Role> findByName(String name);

    Optional<Role> findBySlug(String slug);
    boolean existsBySlug(String slug);
}
