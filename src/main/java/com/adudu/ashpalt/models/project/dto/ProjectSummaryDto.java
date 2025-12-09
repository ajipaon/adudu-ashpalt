package com.adudu.ashpalt.models.project.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public class ProjectSummaryDto {

    private long completed;
    private long updated;
    private long created;
    private long dueSoon;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private Map<String, Long> statusOverview;

    private Map<String, Long> priorityBreakdown;

    private Map<String, Long> typeBreakdown;

    private List<TeamWorkloadDto> teamWorkload;
    private List<EpicProgressDto> epicProgress;

    public long getCompleted() {
        return completed;
    }

    public void setCompleted(long completed) {
        this.completed = completed;
    }

    public long getUpdated() {
        return updated;
    }

    public void setUpdated(long updated) {
        this.updated = updated;
    }

    public long getCreated() {
        return created;
    }

    public void setCreated(long created) {
        this.created = created;
    }

    public long getDueSoon() {
        return dueSoon;
    }

    public void setDueSoon(long dueSoon) {
        this.dueSoon = dueSoon;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Map<String, Long> getStatusOverview() {
        return statusOverview;
    }

    public void setStatusOverview(Map<String, Long> statusOverview) {
        this.statusOverview = statusOverview;
    }

    public Map<String, Long> getPriorityBreakdown() {
        return priorityBreakdown;
    }

    public void setPriorityBreakdown(Map<String, Long> priorityBreakdown) {
        this.priorityBreakdown = priorityBreakdown;
    }

    public Map<String, Long> getTypeBreakdown() {
        return typeBreakdown;
    }

    public void setTypeBreakdown(Map<String, Long> typeBreakdown) {
        this.typeBreakdown = typeBreakdown;
    }

    public List<TeamWorkloadDto> getTeamWorkload() {
        return teamWorkload;
    }

    public void setTeamWorkload(List<TeamWorkloadDto> teamWorkload) {
        this.teamWorkload = teamWorkload;
    }

    public List<EpicProgressDto> getEpicProgress() {
        return epicProgress;
    }

    public void setEpicProgress(List<EpicProgressDto> epicProgress) {
        this.epicProgress = epicProgress;
    }
}
