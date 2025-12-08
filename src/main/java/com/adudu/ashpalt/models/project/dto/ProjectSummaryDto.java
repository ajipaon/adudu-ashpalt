package com.adudu.ashpalt.models.project.dto;

import java.util.List;
import java.util.Map;

public class ProjectSummaryDto {
    private long completed;
    private long updated;
    private long created;
    private long dueSoon;
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

    public static class TeamWorkloadDto {
        private String userName;
        private String userInitial;
        private int percentage;
        private String color; // hex or class

        public String getUserName() {
            return userName;
        }

        public void setUserName(String userName) {
            this.userName = userName;
        }

        public String getUserInitial() {
            return userInitial;
        }

        public void setUserInitial(String userInitial) {
            this.userInitial = userInitial;
        }

        public int getPercentage() {
            return percentage;
        }

        public void setPercentage(int percentage) {
            this.percentage = percentage;
        }

        public String getColor() {
            return color;
        }

        public void setColor(String color) {
            this.color = color;
        }
    }

    public static class EpicProgressDto {
        private String epicName;
        private int completedPercentage;
        private int inProgressPercentage;

        public String getEpicName() {
            return epicName;
        }

        public void setEpicName(String epicName) {
            this.epicName = epicName;
        }

        public int getCompletedPercentage() {
            return completedPercentage;
        }

        public void setCompletedPercentage(int completedPercentage) {
            this.completedPercentage = completedPercentage;
        }

        public int getInProgressPercentage() {
            return inProgressPercentage;
        }

        public void setInProgressPercentage(int inProgressPercentage) {
            this.inProgressPercentage = inProgressPercentage;
        }
    }
}
