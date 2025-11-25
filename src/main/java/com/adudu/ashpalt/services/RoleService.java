package com.adudu.ashpalt.services;

import com.adudu.ashpalt.models.Role;
import com.adudu.ashpalt.repository.RolesRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RoleService {

    private final RolesRepository rolesRepository;

    public RoleService(RolesRepository rolesRepository) {
        this.rolesRepository = rolesRepository;
    }

    public List<Role> findAll(){
        return rolesRepository.findAll();
    }

    public void delete(Long id){

        rolesRepository.deleteById(id);
    }

    public void save(Role role){
        rolesRepository.save(role);
    }

}
