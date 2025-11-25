package com.adudu.ashpalt.views.roleManagement;

import com.adudu.ashpalt.helper.UIAuthorizationHelper;
import com.adudu.ashpalt.models.Role;
import com.adudu.ashpalt.services.AuthorizationService;
import com.adudu.ashpalt.services.PermissionService;
import com.adudu.ashpalt.services.RoleService;
import com.vaadin.flow.component.button.Button;
import com.vaadin.flow.component.confirmdialog.ConfirmDialog;
import com.vaadin.flow.component.grid.Grid;
import com.vaadin.flow.component.icon.VaadinIcon;
import com.vaadin.flow.component.notification.Notification;
import com.vaadin.flow.component.orderedlayout.HorizontalLayout;
import com.vaadin.flow.component.orderedlayout.VerticalLayout;
import com.vaadin.flow.router.PageTitle;
import com.vaadin.flow.router.Route;
import jakarta.annotation.security.RolesAllowed;
import org.springframework.beans.factory.annotation.Autowired;


@PageTitle("Role Management new")
@Route(value = "role-management")
@RolesAllowed("role-view")
public class RoleManagementView extends VerticalLayout {

    private final RoleService roleService;
    private final PermissionService permissionService;
    private final AuthorizationService authorizationService;
    private final UIAuthorizationHelper authHelper;

    private Grid<Role> roleGrid;
    private Button addButton;
    private Button editButton;
    private Button deleteButton;

    @Autowired
    public RoleManagementView(RoleService roleService,
                              PermissionService permissionService,
                              AuthorizationService authorizationService,
                              UIAuthorizationHelper authHelper) {
        this.roleService = roleService;
        this.permissionService = permissionService;
        this.authorizationService = authorizationService;
        this.authHelper = authHelper;

        initComponents();
        setupAuthorization();
        loadRoles();
    }

    private void initComponents() {
        roleGrid = new Grid<>(Role.class, false);
        roleGrid.addColumn(Role::getName).setHeader("Role Name");
        roleGrid.addColumn(Role::getDescription).setHeader("Description");
//        roleGrid.addColumn(role -> role.getUsers().size()).setHeader("User Count");
        roleGrid.addColumn(role -> role.getPermissions().size()).setHeader("Permission Count");

        roleGrid.setItems(roleService.findAll());
        roleGrid.asSingleSelect().addValueChangeListener(e -> updateButtonStates());

        // Buttons
        addButton = new Button("Add Role", VaadinIcon.PLUS.create(), e -> showRoleForm(null));
        editButton = new Button("Edit Role", VaadinIcon.EDIT.create(), e -> editSelectedRole());
        deleteButton = new Button("Delete Role", VaadinIcon.TRASH.create(), e -> deleteSelectedRole());

        HorizontalLayout buttonLayout = new HorizontalLayout(addButton, editButton, deleteButton);

        add(buttonLayout, roleGrid);
    }

    private void setupAuthorization() {
        authHelper.setVisibleIfHasPermission(addButton, "role-create");
        authHelper.setVisibleIfHasPermission(editButton, "role-update");
        authHelper.setVisibleIfHasPermission(deleteButton, "role-delete");

        updateButtonStates();
    }

    private void updateButtonStates() {
        Role selected = roleGrid.asSingleSelect().getValue();
        boolean hasSelection = selected != null;

        editButton.setEnabled(hasSelection && authorizationService.hasPermission("role-update"));
        deleteButton.setEnabled(hasSelection && authorizationService.hasPermission("role-delete"));
    }

    private void editSelectedRole() {
        Role selected = roleGrid.asSingleSelect().getValue();
        if (selected != null) {
            showRoleForm(selected);
        }
    }

    private void deleteSelectedRole() {
        Role selected = roleGrid.asSingleSelect().getValue();
        if (selected != null) {
            ConfirmDialog dialog = new ConfirmDialog();
            dialog.setHeader("Delete Role");
            dialog.setText("Are you sure you want to delete role '" + selected.getName() + "'?");
            dialog.setCancelable(true);
            dialog.setConfirmText("Delete");
            dialog.setConfirmButtonTheme("error primary");

            dialog.addConfirmListener(event -> {
                try {
                    roleService.delete(selected.getId());
                    loadRoles();
                    Notification.show("Role deleted successfully", 3000, Notification.Position.MIDDLE);
                } catch (Exception e) {
                    Notification.show("Error deleting role: " + e.getMessage(), 5000, Notification.Position.MIDDLE);
                }
            });

            dialog.open();
        }
    }

    private void showRoleForm(Role role) {
        RoleFormDialog dialog = new RoleFormDialog(roleService, permissionService, role);
        dialog.addOpenedChangeListener(e -> {
            if (!e.isOpened()) {
                loadRoles();
            }
        });
        dialog.open();
    }

    private void loadRoles() {
        roleGrid.setItems(roleService.findAll());
    }
}