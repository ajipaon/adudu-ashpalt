package com.adudu.ashpalt.data;

import com.adudu.ashpalt.models.Permission;
import com.adudu.ashpalt.models.Role;
import com.adudu.ashpalt.models.User;
import com.adudu.ashpalt.repository.PermissionRepository;
import com.adudu.ashpalt.repository.RolesRepository;
import com.adudu.ashpalt.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.context.event.EventListener;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
@Transactional
public class PermissionInitializerData {

    private static final Logger logger = LoggerFactory.getLogger(PermissionInitializerData.class);

    @Autowired
    private PermissionRepository permissionRepository;
    @Autowired
    private RolesRepository roleRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private boolean initialized = false;

    @EventListener(ContextRefreshedEvent.class)
    public void onApplicationEvent(ContextRefreshedEvent event) {
        if (!initialized) {
            initializePermissionsAndSuperAdmin();
            initialized = true;
        }
    }

    public void initializePermissionsAndSuperAdmin() {
        try {
            initializeSuperAdmin();
            initializePermissions();
        } catch (Exception e) {
            logger.error("Error during initialization: {}", e.getMessage(), e);
        }
    }

    @PostConstruct
    public void initializePermissions() {

        for (String[] data : PermissionList.getPermissions) {

            Optional<Permission> p = permissionRepository.findByName(data[0]);

            if (p.isEmpty()) {
                Permission newPewMission = createPermission(data[0], data[1], data[2], data[3], data[4]);

                permissionRepository.save(newPewMission);
            }
        }

    }

    private Permission createPermission(String name, String slug, String description, String resourceType,
            String actionType) {
        Permission permission = new Permission();
        permission.setName(name);
        permission.setSlug(slug);
        permission.setDescription(description);
        permission.setResourceType(resourceType);
        permission.setActionType(actionType);
        return permission;
    }

    private void initializeSuperAdmin() {

        Optional<User> existingSuperAdmin = userRepository.findByEmail("superadmin@company.com");

        if (existingSuperAdmin.isPresent()) {
            logger.info("Super admin user already exists. Ensuring all permissions...");
            ensureSuperAdminPermissions(existingSuperAdmin.get());
        } else {
            createNewSuperAdmin();
        }

        Optional<Role> roleUser = roleRepository.findByName("ROLE_USER");

        if (roleUser.isEmpty()) {
            Role newUserRole = new Role();
            newUserRole.setSlug("user");
            newUserRole.setName("ROLE_USER");
            newUserRole.setDescription("User with basic access");
            String[] resourceTypes = {"project", "grupchat"};
            Set<Permission> permissions = new HashSet<>();
            for (String resource : resourceTypes) {
                List<Permission> found = permissionRepository.findByResourceType(resource);
                if (found != null && !found.isEmpty()) {
                    permissions.addAll(found);
                }
            }
            newUserRole.setPermissions(permissions);
            roleRepository.save(newUserRole);
        }

        Optional<Role> roleAdmin = roleRepository.findByName("ROLE_ADMIN");

        if (roleAdmin.isEmpty()) {
            Role newAdminRole = new Role();
            newAdminRole.setSlug("admin");
            newAdminRole.setName("ROLE_ADMIN");
            newAdminRole.setDescription("admin with basic access");
            String[] resourceTypes = {"user", "project", "grupchat"};
            Set<Permission> permissions = new HashSet<>();
            for (String resource : resourceTypes) {
                List<Permission> found = permissionRepository.findByResourceType(resource);
                if (found != null && !found.isEmpty()) {
                    permissions.addAll(found);
                }
            }
            newAdminRole.setPermissions(permissions);
            roleRepository.save(newAdminRole);

        }
        createNewAdminAndUser();
    }

    private void createNewSuperAdmin() {
        try {
            logger.info("Creating new super admin user...");

            Role superAdminRole = roleRepository.findByName("ROLE_SUPER_ADMIN")
                    .orElseGet(() -> {
                        Role newRole = new Role();
                        newRole.setSlug("superadmin");
                        newRole.setName("ROLE_SUPER_ADMIN");
                        newRole.setDescription("Super Administrator with full system access");
                        return roleRepository.save(newRole);
                    });

            List<Permission> allPermissions = permissionRepository.findAll();
            superAdminRole.setPermissions(new HashSet<>(allPermissions));
            roleRepository.save(superAdminRole);
            User superAdmin = new User();
            superAdmin.setUsername("superadmin");
            superAdmin.setEmail("superadmin@company.com");
            superAdmin.setHashedPassword(passwordEncoder.encode("q"));
            superAdmin.setName("Super Administrator");
            superAdmin.setActive(true);

            superAdmin.setRole(superAdminRole);

            userRepository.save(superAdmin);

            logger.info("Super admin user created successfully with {} permissions", allPermissions.size());

        } catch (Exception e) {
            logger.error("Error creating super admin: {}", e.getMessage(), e);
        }
    }

    private void createNewAdminAndUser() {
        try {
            Optional<User> existingAdmin = userRepository.findByEmail("admin@company.com");

            if (existingAdmin.isEmpty()) {
                logger.info("Creating new admin...");

                Optional<Role> adminRole = roleRepository.findByName("ROLE_ADMIN");
                if (!adminRole.isEmpty()) {
                    User superAdmin = new User();
                    superAdmin.setUsername("admin");
                    superAdmin.setEmail("admin@company.com");
                    superAdmin.setHashedPassword(passwordEncoder.encode("q"));
                    superAdmin.setName("Admin");
                    superAdmin.setActive(true);
                    superAdmin.setRole(adminRole.get());
                    userRepository.save(superAdmin);
                }
            }
            Optional<User> existingUser = userRepository.findByEmail("user@company.com");

            if (existingUser.isEmpty()) {
                logger.info("Creating new user...");

                Optional<Role> userRole = roleRepository.findByName("ROLE_USER");
                if (!userRole.isEmpty()) {
                    User user = new User();
                    user.setUsername("user");
                    user.setEmail("user@company.com");
                    user.setHashedPassword(passwordEncoder.encode("q"));
                    user.setName("User");
                    user.setActive(true);
                    user.setRole(userRole.get());
                    userRepository.save(user);
                }
            }

        } catch (Exception e) {
            logger.error("Error creating super admin: {}", e.getMessage(), e);
        }
    }

    private void ensureSuperAdminPermissions(User superAdmin) {
        try {
            Role superAdminRole = roleRepository.findByName("ROLE_SUPER_ADMIN")
                    .orElseGet(() -> {
                        Role newRole = new Role();
                        newRole.setName("ROLE_SUPER_ADMIN");
                        newRole.setDescription("Super Administrator with full system access");
                        return roleRepository.save(newRole);
                    });

            List<Permission> allPermissions = permissionRepository.findAll();
            superAdminRole.setPermissions(new HashSet<>(allPermissions));
            roleRepository.save(superAdminRole);

            // 3. Assign role ke user jika belum ada
            if (!superAdmin.getRole().equals(superAdminRole)) {
                superAdmin.setRole(superAdminRole);
                userRepository.save(superAdmin);
                logger.info("Super admin role assigned to existing user");
            }

            logger.info("Super admin permissions ensured. Total permissions: {}", allPermissions.size());

        } catch (Exception e) {
            logger.error("Error ensuring super admin permissions: {}", e.getMessage(), e);
        }
    }

    public boolean isInitialized() {
        return initialized;
    }

}