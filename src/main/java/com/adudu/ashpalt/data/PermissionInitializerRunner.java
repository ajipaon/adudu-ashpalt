package com.adudu.ashpalt.data;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
public class PermissionInitializerRunner implements ApplicationRunner {

    private final PermissionInitializerData permissionInitializerData;

    public PermissionInitializerRunner(PermissionInitializerData permissionInitializerService) {
        this.permissionInitializerData = permissionInitializerService;
    }

    @Override
    public void run(ApplicationArguments args) throws Exception {
        System.out.println("ApplicationRunner: Initializing permissions...");
    }
}
