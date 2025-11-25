package com.adudu.ashpalt.views.userManagement;

import com.adudu.ashpalt.models.Role;
import com.adudu.ashpalt.models.User;
import com.adudu.ashpalt.services.RoleService;
import com.adudu.ashpalt.services.UserService;
import com.vaadin.flow.component.button.Button;
import com.vaadin.flow.component.dialog.Dialog;
import com.vaadin.flow.component.formlayout.FormLayout;
import com.vaadin.flow.component.html.H3;
import com.vaadin.flow.component.notification.Notification;
import com.vaadin.flow.component.orderedlayout.FlexComponent;
import com.vaadin.flow.component.orderedlayout.HorizontalLayout;
import com.vaadin.flow.component.orderedlayout.VerticalLayout;
import com.vaadin.flow.component.select.Select;
import com.vaadin.flow.component.textfield.EmailField;
import com.vaadin.flow.component.textfield.PasswordField;
import com.vaadin.flow.component.textfield.TextField;
import com.vaadin.flow.component.checkbox.Checkbox;
import com.vaadin.flow.data.binder.Binder;
import com.vaadin.flow.data.binder.ValidationException;

import java.util.List;

public class UserFormDialog extends Dialog {

    private final UserService userService;
    private final RoleService roleService;
    private final Binder<User> binder;
    private User user;

    private TextField usernameField;
    private TextField nameField;
    private EmailField emailField;
    private PasswordField passwordField;
    private Checkbox activeCheckbox;
    private Button saveButton;
    private Button cancelButton;
    private Select<Role> roleSelect;

    public UserFormDialog(UserService userService, User user, RoleService roleService) {
        this.userService = userService;
        this.user = user != null ? user : new User();
        this.binder = new Binder<>(User.class);
        this.roleService = roleService;

        initComponents();
        setupBinder();

        if (user != null) {
            binder.readBean(user);
            if (user.getRole() != null) {
                roleSelect.setValue(user.getRole());
            }
        }
    }

    private void initComponents() {
        setWidth("500px");

        H3 title = new H3(user.getId() != null ? "Edit User" : "Create New User");

        usernameField = new TextField("Username");
        usernameField.setRequired(true);

        nameField = new TextField("Full Name");

        emailField = new EmailField("Email");
        emailField.setRequiredIndicatorVisible(true);

        passwordField = new PasswordField("Password");
        passwordField.setPlaceholder("Leave blank to keep existing password");

        activeCheckbox = new Checkbox("Active");

        roleSelect = new Select<>();
        roleSelect.setLabel("Role");
        List<Role> allRoles = roleService.findAll();
        roleSelect.setItems(allRoles);
        roleSelect.setItemLabelGenerator(Role::getName);

        saveButton = new Button("Save", e -> saveUser());
        cancelButton = new Button("Cancel", e -> close());
        HorizontalLayout buttons = new HorizontalLayout(saveButton, cancelButton);
        buttons.setJustifyContentMode(FlexComponent.JustifyContentMode.END);

        FormLayout formLayout = new FormLayout(
                usernameField,
                nameField,
                emailField,
                passwordField,
                roleSelect,
                activeCheckbox
        );

        VerticalLayout layout = new VerticalLayout(title, formLayout, buttons);
        layout.setPadding(true);
        layout.setSpacing(true);

        add(layout);
    }

    private void setupBinder() {
        binder.forField(usernameField)
                .asRequired("Username is required")
                .bind(User::getUsername, User::setUsername);

        binder.forField(nameField)
                .bind(User::getName, User::setName);

        binder.forField(emailField)
                .asRequired("Email is required")
                .bind(User::getEmail, User::setEmail);

        binder.forField(roleSelect)
                .asRequired("Role is required")
                .bind(User::getRole, User::setRole);

        binder.forField(activeCheckbox)
                .bind(User::isActive, User::setActive);
    }

    private void saveUser() {
        try {
            binder.writeBean(user);
            if (passwordField.getValue() != null && !passwordField.getValue().isEmpty()) {
                user.setHashedPassword(userService.encodePassword(passwordField.getValue()));
            }
            userService.save(user);
            Notification.show("User saved successfully", 3000, Notification.Position.MIDDLE);
            close();
        } catch (ValidationException e) {
            Notification.show("Please correct the errors before saving.", 3000, Notification.Position.MIDDLE);
        } catch (Exception e) {
            Notification.show("Error saving user: " + e.getMessage(), 5000, Notification.Position.MIDDLE);
        }
    }
}
