package com.adudu.ashpalt.services;

import com.adudu.ashpalt.models.User;
import com.adudu.ashpalt.repository.UserRepository;
import com.vaadin.hilla.BrowserCallable;
import jakarta.annotation.security.PermitAll;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@BrowserCallable
@PermitAll
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public Optional<User> get(UUID id) {
        return userRepository.findById(id);
    }

    public User save(User entity) {
        return userRepository.save(entity);
    }

    public void delete(UUID id) {
        userRepository.deleteById(id);
    }

    public Page<User> list(Pageable pageable) {
        return userRepository.findAll(pageable);
    }

    public Page<User> list(Pageable pageable, Specification<User> filter) {
        return userRepository.findAll(filter, pageable);
    }

    public int count() {
        return (int) userRepository.count();
    }

    public Page<User> findUserOrEmail(String username, String email, Pageable pageable) {
        return userRepository.findByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCase(username, email, pageable);
    }

    public Long countByUsernameOrEmail(String username, String email) {
        return userRepository.countByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCase(username, email);
    }

    public String encodePassword(String password) {
        return passwordEncoder.encode(password);
    }

    public List<User> findAll() {
        return userRepository.findAll();
    }

}
