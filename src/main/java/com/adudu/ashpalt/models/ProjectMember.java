package com.adudu.ashpalt.models;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "project_member")
public class ProjectMember {

    @Id
    private UUID id = UUID.randomUUID();

    @Column(name = "project_id", nullable = false)
    private UUID projectId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "role", nullable = false)
    private ProjectMemberRole role;

    @Column(name = "added_at")
    private LocalDateTime addedAt;

    private ProjectGroupMember projectGroupMember = ProjectGroupMember.PROJECT_GROUP_MEMBER;

    @PrePersist
    protected void onCreate() {
        addedAt = LocalDateTime.now();
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getProjectId() {
        return projectId;
    }

    public void setProjectId(UUID projectId) {
        this.projectId = projectId;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public ProjectMemberRole getRole() {
        return role;
    }

    public void setRole(ProjectMemberRole role) {
        this.role = role;
    }

    public LocalDateTime getAddedAt() {
        return addedAt;
    }

    public void setAddedAt(LocalDateTime addedAt) {
        this.addedAt = addedAt;
    }

    public ProjectGroupMember getProjectGroupMember() {
        return projectGroupMember;
    }
    public void setProjectGroupMember(ProjectGroupMember projectGroupMember) {
        this.projectGroupMember = projectGroupMember;
    }
}
