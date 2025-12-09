package com.adudu.ashpalt.models.project.dto;

import java.util.UUID;

public class TeamWorkloadDto {

    private UUID userId;
    private String userName;
    private int totalTasks;
    private int completedTasks;
    private int inProgressTasks;
    private int pendingTasks;

    public UUID getUserId() {
        return userId;
    }
    public void setUserId(UUID userId) {
        this.userId = userId;
    }
    public String getUserName() {
        return userName;
    }
    public void setUserName(String userName) {
        this.userName = userName;
    }
    public int getTotalTasks() {
        return totalTasks;
    }
    public void setTotalTasks(int totalTasks) {
        this.totalTasks = totalTasks;
    }
    public int getCompletedTasks() {
        return completedTasks;
    }
    public void setCompletedTasks(int completedTasks) {
        this.completedTasks = completedTasks;
    }
    public int getInProgressTasks() {
        return inProgressTasks;
    }
    public void setInProgressTasks(int inProgressTasks) {
        this.inProgressTasks = inProgressTasks;
    }
    public int getPendingTasks() {
        return pendingTasks;
    }
    public void setPendingTasks(int pendingTasks) {
        this.pendingTasks = pendingTasks;
    }

}
