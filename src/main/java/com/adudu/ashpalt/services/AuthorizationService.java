package com.adudu.ashpalt.services;

import com.adudu.ashpalt.repository.UserRepository;
import com.adudu.ashpalt.models.User;
import com.adudu.ashpalt.models.Permission;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class AuthorizationService {

    private final UserRepository userRepository;

    public AuthorizationService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public boolean hasPermission(String permission) {
        return getCurrentUserPermissions().contains(permission);
    }

    public boolean hasAnyPermission(String permissions) {
        Set<String> userPermissions = getCurrentUserPermissions();
        return userPermissions.stream().anyMatch(userPermission -> userPermissions.contains(permissions));
    }

    public boolean hasAllPermissions(String... permissions) {
        Set<String> userPermissions = getCurrentUserPermissions();
        return Arrays.stream(permissions)
                .allMatch(userPermissions::contains);
    }

    public boolean hasRole(String role) {
        return getCurrentUserRoles().contains(role);
    }

    public boolean hasAnyRole(String... roles) {
        String userRoles = getCurrentUserRoles();
        return Arrays.stream(roles)
                .anyMatch(userRoles::contains);
    }

    public boolean hasAllRoles(String... roles) {
        String userRoles = getCurrentUserRoles();
        return Arrays.stream(roles)
                .allMatch(userRoles::contains);
    }

    public Set<String> getCurrentUserPermissions() {
        User currentUser = getCurrentUser();
        if (currentUser == null) {
            return Collections.emptySet();
        }

        return currentUser.getRole().getPermissions().stream()
                .map(Permission::getSlug)
                .collect(Collectors.toSet());
    }

    public String getCurrentUserRoles() {
        User currentUser = getCurrentUser();

        return currentUser.getRole().getSlug();
    }

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }

        Object principal = authentication.getPrincipal();
        String username;

        if (principal instanceof UserDetails) {
            username = ((UserDetails) principal).getUsername();
        } else if (principal instanceof String) {
            username = (String) principal;
        } else {
            return null;
        }

        return Objects.requireNonNull(userRepository.findByUsernameWithRolesAndPermissions(username)
                .orElse(null));
    }


    public boolean isAuthenticated() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null &&
                authentication.isAuthenticated() &&
                !(authentication.getPrincipal() instanceof String &&
                        "anonymousUser".equals(authentication.getPrincipal()));
    }

    public boolean isAdminOrHasPermission(String permission) {
        return hasRole("admin") || hasPermission(permission);
    }

    public boolean isAdminOrHasAnyPermission(String permissions) {
        return hasRole("admin") || hasAnyPermission(permissions);
    }


    public boolean isAdminOrHasAllPermissions(String... permissions) {
        return hasRole("admin") || hasAllPermissions(permissions);
    }

    public Set<String> getUserPermissions(String username) {
        return userRepository.findByUsernameWithRolesAndPermissions(username)
                .map(user -> user.getRole().getPermissions().stream()
                        .map(Permission::getSlug)
                        .collect(Collectors.toSet()))
                .orElse(Collections.emptySet());
    }

    public String getUserRoleSlug(String email) {
        return Objects.requireNonNull(userRepository.findByEmailWithRolesAndPermissions(email)
                .map(user -> user.getRole().getSlug())
                .orElse(null));
    }
}