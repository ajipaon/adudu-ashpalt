package com.adudu.ashpalt.repository;

import java.util.Optional;
import java.util.UUID;

import com.adudu.ashpalt.models.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, UUID>, JpaSpecificationExecutor<User> {

    Optional<User> findByUsername(String username);

    @EntityGraph(attributePaths = {"role", "role.permissions"})
    @Query("SELECT u FROM User u WHERE u.username = :username AND u.active = true")
    Optional<User> findByUsernameWithRolesAndPermissions(@Param("username") String username);

    @EntityGraph(attributePaths = {"role", "role.permissions"})
    @Query("SELECT u FROM User u WHERE u.email = :email AND u.active = true")
    Optional<User> findByEmailWithRolesAndPermissions(@Param("email") String email);

    boolean existsByUsername(String username);
    boolean existsByEmail(String email);

    Optional<User> findByEmail(String username);

    Page<User> findByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCase(String username, String email, Pageable pageable);

    long countByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCase(String username, String email);

}
