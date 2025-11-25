package com.adudu.ashpalt.security;

import static com.vaadin.flow.spring.security.VaadinSecurityConfigurer.vaadin;

import com.vaadin.flow.spring.security.VaadinAwareSecurityContextHolderStrategyConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@EnableWebSecurity
@Configuration
@Import(VaadinAwareSecurityContextHolderStrategyConfiguration.class)
public class SecurityConfiguration {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain vaadinSecurityFilterChain(HttpSecurity http) throws Exception {
        http.authorizeHttpRequests(authorize -> authorize.requestMatchers("/hello-world-hilla").permitAll());

        http.authorizeHttpRequests(authorize -> authorize.requestMatchers("/images/*.png").permitAll());

        http.authorizeHttpRequests(authorize -> authorize.requestMatchers("/line-awesome/**").permitAll());

        http.authorizeHttpRequests(authorize -> authorize.requestMatchers("/").authenticated());


        http.with(vaadin(), vaadin -> {
            vaadin.loginView("/login", "/");
        });

        return http.build();
    }

}
