package com.adudu.ashpalt.models.project.dto;

import java.util.UUID;

public class PostmetaStatsDto {
    private UUID id;
    private String postType;
    private String postParentTitle;
    private String postTitle;
    private String postContent;
    private String postContentType;
    private String postStatus;
    private UUID postParent;
    private Integer postOrder;
    private UUID authorId;

    public PostmetaStatsDto(UUID id, String postType, String postParentTitle, String postTitle,
                            String postContent, String postContentType, String postStatus,
                            UUID postParent, Integer postOrder, UUID authorId) {
        this.id = id;
        this.postType = postType;
        this.postParentTitle = postParentTitle;
        this.postTitle = postTitle;
        this.postContent = postContent;
        this.postContentType = postContentType;
        this.postStatus = postStatus;
        this.postParent = postParent;
        this.postOrder = postOrder;
        this.authorId = authorId;
    }

    public UUID getId() {
        return id;
    }
    public void setId(UUID id) {
        this.id = id;
    }
    public String getPostType() {
        return postType;
    }
    public void setPostType(String postType) {
        this.postType = postType;
    }
    public String getPostParentTitle() {
        return postParentTitle;
    }
    public void setPostParentTitle(String pstParentTitle) {
        this.postParentTitle = pstParentTitle;
    }
    public String getPostTitle() {
        return postTitle;
    }
    public void setPostTitle(String postTitle) {
        this.postTitle = postTitle;
    }
    public String getPostContent() {
        return postContent;
    }
    public void setPostContent(String postContent) {
        this.postContent = postContent;
    }
    public String getPostContentType() {
        return postContentType;
    }
    public void setPostContentType(String postContentType) {
        this.postContentType = postContentType;
    }
    public String getPostStatus() {
        return postStatus;
    }
    public void setPostStatus(String postStatus) {
        this.postStatus = postStatus;
    }
    public UUID getPostParent() {
        return postParent;
    }
    public void setPostParent(UUID postParent) {
        this.postParent = postParent;
    }
    public Integer getPostOrder() {
        return postOrder;
    }
    public void setPostOrder(Integer postOrder) {
        this.postOrder = postOrder;
    }
    public UUID getAuthorId() {
        return authorId;
    }
    public void setAuthorId(UUID authorId) {
        this.authorId = authorId;
    }

}
