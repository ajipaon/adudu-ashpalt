package com.adudu.ashpalt.data;

import java.util.Arrays;
import java.util.List;

public class PermissionList {

    public static final List<String[]> getPermissions = Arrays.asList(

            new String[] { "settingMaster.view", "settingMaster-view", "View settingMaster annd manage service", "setting", "view" },

            new String[] { "user.view", "user-view", "View user list and details", "user", "view" },
            new String[] { "user.create", "user-create", "Create new users", "user", "create" },
            new String[] { "user.update", "user-update", "Edit user information", "user", "update" },
            new String[] { "user.delete", "user-delete", "Delete users", "user", "delete" },

            new String[] { "project.view", "project-view", "View project list and details", "project", "view" },
            new String[] { "project.create", "project-create", "Create new project", "project", "create" },
            new String[] { "project.update", "project-update", "Edit project information", "project", "update" },
            new String[] { "project.delete", "project-delete", "Delete project", "project", "delete" },

            new String[] { "grupchat.view", "grupchat-view", "View grupchat list and details", "grupchat", "view" },
            new String[] { "grupchat.create", "grupchat-create", "Create new grupchat", "grupchat", "create" },
            new String[] { "grupchat.update", "grupchat-update", "Edit grupchat information", "grupchat", "update" },
            new String[] { "grupchat.delete", "grupchat-delete", "Delete grupchat", "grupchat", "delete" },

            new String[] { "role.view", "role-view", "View roles and permissions", "role", "view" },
            new String[] { "role.create", "role-create", "Create new roles", "role", "create" },
            new String[] { "role.update", "role-update", "Edit roles and permissions", "role", "update" },
            new String[] { "role.delete", "role-delete", "Delete roles", "role", "delete" });
}
