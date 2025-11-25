package com.adudu.ashpalt.views.userManagement;

import com.adudu.ashpalt.helper.UIAuthorizationHelper;
import com.adudu.ashpalt.models.User;
import com.adudu.ashpalt.services.AuthorizationService;
import com.adudu.ashpalt.services.RoleService;
import com.adudu.ashpalt.services.UserService;
import com.vaadin.flow.component.button.Button;
import com.vaadin.flow.component.confirmdialog.ConfirmDialog;
import com.vaadin.flow.component.grid.Grid;
import com.vaadin.flow.component.grid.dataview.GridLazyDataView;
import com.vaadin.flow.component.icon.VaadinIcon;
import com.vaadin.flow.component.notification.Notification;
import com.vaadin.flow.component.orderedlayout.HorizontalLayout;
import com.vaadin.flow.component.orderedlayout.VerticalLayout;
import com.vaadin.flow.data.provider.CallbackDataProvider;
import com.vaadin.flow.router.Menu;
import com.vaadin.flow.router.PageTitle;
import com.vaadin.flow.router.Route;
import jakarta.annotation.security.RolesAllowed;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.vaadin.lineawesome.LineAwesomeIconUrl;

@PageTitle("User Management")
@Route(value = "user-management")
@Menu(order = 1, icon = LineAwesomeIconUrl.COMMENTS)
@RolesAllowed("user-view")
public class UserManagementView extends VerticalLayout {

    private final UserService userService;
    private final AuthorizationService authorizationService;
    private final UIAuthorizationHelper authHelper;
    private final RoleService roleService;

    private Grid<User> userGrid;
    private GridLazyDataView<User> lazyDataView;

    private Button addButton;
    private Button editButton;
    private Button deleteButton;

    @Autowired
    public UserManagementView(UserService userService,
                              AuthorizationService authorizationService,
                              UIAuthorizationHelper authHelper, RoleService roleService) {
        this.userService = userService;
        this.authorizationService = authorizationService;
        this.authHelper = authHelper;

        initComponents();
        setupAuthorization();
        setupLazyPagination();
        this.roleService = roleService;
    }

    private void initComponents() {
        setSizeFull();
        setPadding(true);

        userGrid = new Grid<>(User.class, false);
        userGrid.addColumn(User::getUsername).setHeader("Username");
        userGrid.addColumn(User::getEmail).setHeader("Email");
        userGrid.addColumn(User::getName).setHeader("Full Name");
        userGrid.addColumn(user -> user.isActive() ? "Active" : "Inactive").setHeader("Status");
        userGrid.addColumn(User::getCreatedAt).setHeader("Created At");
        userGrid.setSizeFull();
        userGrid.asSingleSelect().addValueChangeListener(e -> updateButtonStates());

        addButton = new Button("Add User", VaadinIcon.PLUS.create(), e -> showUserForm(null));
        editButton = new Button("Edit User", VaadinIcon.EDIT.create(), e -> editSelectedUser());
        deleteButton = new Button("Delete User", VaadinIcon.TRASH.create(), e -> deleteSelectedUser());

        HorizontalLayout buttons = new HorizontalLayout(addButton, editButton, deleteButton);
        add(buttons, userGrid);
    }

    private void setupAuthorization() {
        authHelper.setVisibleIfHasPermission(addButton, "user-create");
        authHelper.setVisibleIfHasPermission(editButton, "user-update");
        authHelper.setVisibleIfHasPermission(deleteButton, "user-delete");

        updateButtonStates();
    }

    private void setupLazyPagination() {
        // CallbackDataProvider untuk pagination
        CallbackDataProvider<User, Void> dataProvider = new CallbackDataProvider<>(
                query -> {
                    int offset = query.getOffset();
                    int limit = query.getLimit();
                    int page = offset / limit;

                    Pageable pageable = PageRequest.of(page, limit);
                    Page<User> pageData = userService.list(pageable);

                    return pageData.getContent().stream();
                },
                query -> (int) userService.count()
        );

        // Set provider dan aktifkan lazy mode
        lazyDataView = userGrid.setItems(dataProvider);
        userGrid.setPageSize(20); // jumlah item per halaman
    }

    private void updateButtonStates() {
        User selected = userGrid.asSingleSelect().getValue();
        boolean hasSelection = selected != null;

        editButton.setEnabled(hasSelection && authorizationService.hasPermission("user-update"));
        deleteButton.setEnabled(hasSelection && authorizationService.hasPermission("user-delete"));
    }

    private void showUserForm(User user) {
        UserFormDialog dialog = new UserFormDialog(userService, user, roleService);
        dialog.addOpenedChangeListener(e -> {
            if (!e.isOpened()) {
                lazyDataView.refreshAll(); // refresh data setelah dialog ditutup
            }
        });
        dialog.open();
    }

    private void editSelectedUser() {
        User selected = userGrid.asSingleSelect().getValue();
        if (selected != null) {
            showUserForm(selected);
        }
    }

    private void deleteSelectedUser() {
        User selected = userGrid.asSingleSelect().getValue();
        if (selected == null) return;

        ConfirmDialog dialog = new ConfirmDialog();
        dialog.setHeader("Delete User");
        dialog.setText("Are you sure you want to delete user '" + selected.getUsername() + "'?");
        dialog.setCancelable(true);
        dialog.setConfirmText("Delete");
        dialog.setConfirmButtonTheme("error primary");

        dialog.addConfirmListener(event -> {
            try {
                userService.delete(selected.getId());
                lazyDataView.refreshAll();
                Notification.show("User deleted successfully", 3000, Notification.Position.TOP_CENTER);
            } catch (Exception ex) {
                Notification.show("Error deleting user: " + ex.getMessage(), 5000, Notification.Position.TOP_CENTER);
            }
        });

        dialog.open();
    }
}
