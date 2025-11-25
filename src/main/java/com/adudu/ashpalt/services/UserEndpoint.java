package com.adudu.ashpalt.services;

import com.adudu.ashpalt.security.AuthenticatedUser;
import com.adudu.ashpalt.security.CustomUserDetails;
import com.vaadin.flow.server.auth.AnonymousAllowed;
import com.vaadin.hilla.BrowserCallable;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;

@BrowserCallable
@AnonymousAllowed
public class UserEndpoint {

    @Autowired
    private AuthenticatedUser authenticatedUser;

    public Optional<CustomUserDetails> getAuthenticatedUser() {
        return authenticatedUser.get();
    }
}
