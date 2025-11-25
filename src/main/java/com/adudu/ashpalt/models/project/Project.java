package com.adudu.ashpalt.models.project;

import jakarta.persistence.*;

import java.util.UUID;

@Entity
@Table(name = "project")
public class Project {

    @Id
    private UUID id = UUID.randomUUID();

    private String title;
    private String description;

    @Column(name = "created_by")
    private UUID createdBy;

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public UUID getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(UUID createdBy) {
        this.createdBy = createdBy;
    }

}
