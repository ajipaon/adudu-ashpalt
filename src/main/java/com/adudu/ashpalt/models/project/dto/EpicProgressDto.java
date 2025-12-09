package com.adudu.ashpalt.models.project.dto;

import java.util.UUID;

public class EpicProgressDto {
    private UUID epicId;
    private String epicName;
    private int totalTasks;
    private int completedTasks;
    private double progressPercentage;

    public UUID getEpicId() {
        return epicId;
    }
    public void setEpicId(UUID epicId) {
        this.epicId = epicId;
    }
    public String getEpicName() {
        return epicName;
    }
    public  void setEpicName(String epicName) {
        this.epicName = epicName;
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
    public double getProgressPercentage() {
        return progressPercentage;
    }

}
