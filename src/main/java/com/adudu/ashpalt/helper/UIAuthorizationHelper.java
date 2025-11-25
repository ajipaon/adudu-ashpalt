package com.adudu.ashpalt.helper;

import com.adudu.ashpalt.services.AuthorizationService;
import com.vaadin.flow.component.Component;

@org.springframework.stereotype.Component
public class UIAuthorizationHelper {

    private final AuthorizationService authorizationService;

    public UIAuthorizationHelper(AuthorizationService authorizationService) {
        this.authorizationService = authorizationService;
    }

     public void setVisibleIfHasPermission(Component component, String permissions) {
        boolean hasPermission = authorizationService.hasAnyPermission(permissions);
        component.setVisible(hasPermission);
    }

    public boolean hasPermission(String permission) {
        return authorizationService.hasPermission(permission);
    }

    public boolean hasRole(String role) {
        return authorizationService.hasRole(role);
    }
}
