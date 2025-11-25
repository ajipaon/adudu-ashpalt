package com.adudu.ashpalt.security;

import com.adudu.ashpalt.models.User;
import com.adudu.ashpalt.repository.UserRepository;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.stream.Collectors;

@Service
class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));

        if (!user.isActive()) {
            throw new UsernameNotFoundException("User account is disabled");
        }
        return new CustomUserDetails(
                user.getId(),
                user.getUsername(),
                user.getPassword(),
                user.getRole().getName(),
                user.isActive(),
                true,
                true,
                true,
                getAuthorities(user)
        );
    }

    private Set<GrantedAuthority> getAuthorities(User user) {

        return user.getRole().getPermissions().stream()
                .map(permission -> new SimpleGrantedAuthority("ROLE_"+ permission.getSlug()))
                .collect(Collectors.toSet());
    }
}