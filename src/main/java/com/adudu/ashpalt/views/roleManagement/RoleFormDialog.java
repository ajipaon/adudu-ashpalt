package com.adudu.ashpalt.views.roleManagement;

import com.adudu.ashpalt.data.PermissionList;
import com.adudu.ashpalt.models.Permission;
import com.adudu.ashpalt.models.Role;
import com.adudu.ashpalt.services.PermissionService;
import com.adudu.ashpalt.services.RoleService;
import com.vaadin.flow.component.button.Button;
import com.vaadin.flow.component.checkbox.CheckboxGroup;
import com.vaadin.flow.component.checkbox.CheckboxGroupVariant;
import com.vaadin.flow.component.dialog.Dialog;
import com.vaadin.flow.component.formlayout.FormLayout;
import com.vaadin.flow.component.html.H3;
import com.vaadin.flow.component.notification.Notification;
import com.vaadin.flow.component.orderedlayout.FlexComponent;
import com.vaadin.flow.component.orderedlayout.HorizontalLayout;
import com.vaadin.flow.component.orderedlayout.VerticalLayout;
import com.vaadin.flow.component.textfield.TextField;
import com.vaadin.flow.component.textfield.TextArea;
import com.vaadin.flow.data.binder.Binder;
import com.vaadin.flow.data.binder.ValidationException;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

public class RoleFormDialog extends Dialog {

    private final RoleService roleService;
    private final PermissionService permissionService;
    private static final Map<String, String> PERMISSION_DESCRIPTIONS = new HashMap<>();
    private final Role role;
    private final Binder<Role> binder;

    private TextField nameField;
    private TextArea descriptionField;
    private CheckboxGroup<Permission> permissionCheckboxGroup;
    private Button saveButton;
    private Button cancelButton;

    static {
        for (String[] p : PermissionList.getPermissions) {
            PERMISSION_DESCRIPTIONS.put(p[0], p[1].replace("-", " "));
        }
    }

    public RoleFormDialog(RoleService roleService, PermissionService permissionService,  Role role) {
        this.roleService = roleService;
        this.permissionService = permissionService;
        this.role = role != null ? role : new Role();
        this.binder = new Binder<>(Role.class);

        initComponents();
        setupBinder();
        loadPermissions();

        if (role != null) {
            binder.readBean(role);
        }
    }

    private void initComponents() {
        setWidth("1000px");
        setHeight("700px");

        H3 title = new H3(role.getId() != null ? "Edit Role" : "Create New Role");

        nameField = new TextField("Role Name");
        nameField.setRequired(true);
        nameField.addValueChangeListener(e -> {
            String value = e.getValue();
            if (value != null) {
                value = value.toUpperCase().replace(" ", "_");
                nameField.setValue(value);
            }
        });

        descriptionField = new TextArea("Description");
        descriptionField.setHeight("80px");

        H3 permissionTitle = new H3("Permissions");

        Button selectAllBtn = new Button("Select All", e -> selectAllPermissions(true));
        Button selectNoneBtn = new Button("Do not select any", e -> selectAllPermissions(false));
        HorizontalLayout permissionActions = new HorizontalLayout(selectAllBtn, selectNoneBtn);

        permissionCheckboxGroup = new CheckboxGroup<>();
        permissionCheckboxGroup.setLabel("Select Permissions");
        permissionCheckboxGroup.addThemeVariants(CheckboxGroupVariant.LUMO_VERTICAL);

        FormLayout formLayout = new FormLayout();
        formLayout.add(nameField, descriptionField);

        saveButton = new Button("Save", e -> saveRole());
        cancelButton = new Button("Cancel", e -> close());
        HorizontalLayout buttonLayout = new HorizontalLayout(saveButton, cancelButton);
        buttonLayout.setJustifyContentMode(FlexComponent.JustifyContentMode.END);

        VerticalLayout content = new VerticalLayout(
                title, formLayout, permissionTitle,
                permissionActions, permissionCheckboxGroup, buttonLayout
        );
        content.setPadding(true);

        add(content);
    }

    private void setupBinder() {
        binder.forField(nameField)
                .asRequired("Role name is required")
                .bind(Role::getName, Role::setName);

        binder.forField(descriptionField)
                .bind(Role::getDescription, Role::setDescription);

        binder.forField(permissionCheckboxGroup)
                .bind(Role::getPermissions,
                        (role, permissions) -> role.setPermissions(new HashSet<>(permissions)));
    }

    private void loadPermissions() {
        Set<Permission> allPermissions = permissionService.getAllPermissions();

        permissionCheckboxGroup.setItems(allPermissions);
        permissionCheckboxGroup.setItemLabelGenerator(permission -> {
            String permissionName = permission.getName();
            return String.format("%s - %s", permissionName, getPermissionDescription(permissionName));
        });

        if (role.getId() != null) {
            permissionCheckboxGroup.setValue(role.getPermissions());
        }
    }

    public static String getPermissionDescription(String permission) {
        return PERMISSION_DESCRIPTIONS.getOrDefault(permission, permission);
    }

    private void selectAllPermissions(boolean selectAll) {
        if (selectAll) {
            permissionCheckboxGroup.setValue(
                    permissionCheckboxGroup.getListDataView().getItems().collect(Collectors.toSet())
            );
        } else {
            permissionCheckboxGroup.setValue(new HashSet<>());
        }
    }

    private void saveRole() {
        try {
            binder.writeBean(role);
            role.setSlug(role.getName());
            roleService.save(role);
            close();
        } catch (ValidationException e) {

        } finally {
            Notification.show("Role invalid ", 3000, Notification.Position.MIDDLE);
            close();
        }
    }
}