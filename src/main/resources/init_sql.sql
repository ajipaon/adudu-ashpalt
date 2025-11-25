
INSERT INTO role (name, description,slug, created_at, updated_at)
SELECT 'ROLE_SUPER_ADMIN', 'Super Administrator with full system access','super.admin', NOW(), NOW()
    WHERE NOT EXISTS (SELECT 1 FROM role WHERE name = 'ROLE_SUPER_ADMIN');

-- 2. Berikan semua permissions
WITH super_admin AS (
    SELECT id FROM role WHERE name = 'ROLE_SUPER_ADMIN'
)
INSERT INTO role_permissions (role_id, permission_id)
SELECT sa.id, p.id
FROM super_admin sa, permissions p
WHERE NOT EXISTS (
    SELECT 1 FROM role_permissions rp
    WHERE rp.role_id = sa.id AND rp.permission_id = p.id
);
-- password superadmin123
INSERT INTO users (id, username, email, hashed_password, name, active, created_at, updated_at)
SELECT
    gen_random_uuid(),
    'superadmin',
    'superadmin@company.com',
    '$2a$12$K1d7N7u8p5V2vV2h6Z8nB.FnLw8qkQwXrN8gY2vV5nY5JkLmN8vH6',
    'Super Administrator',
    TRUE,
    NOW(),
    NOW()
    WHERE NOT EXISTS (
    SELECT 1 FROM users WHERE username = 'superadmin'
);



-- 4. Assign role ke user
WITH super_admin_role AS (
    SELECT id FROM role WHERE name = 'ROLE_SUPER_ADMIN'
),
     super_admin_user AS (
         SELECT id FROM users WHERE username = 'superadmin'
     )
INSERT INTO user_roles (user_id, role_id)
SELECT sau.id, sar.id
FROM super_admin_user sau, super_admin_role sar
WHERE NOT EXISTS (
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = sau.id AND ur.role_id = sar.id
);