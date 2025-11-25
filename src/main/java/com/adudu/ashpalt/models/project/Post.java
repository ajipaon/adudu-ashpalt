package com.adudu.ashpalt.models.project;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "post")
public class Post {

    @Id
    private UUID id = UUID.randomUUID();

    @Column(name = "post_type", nullable = false)
    private String postType;
    @Column(name = "post_title")
    private String postTitle;

    @Column(name = "post_content", columnDefinition = "TEXT")
    private String postContent;

    @Column(name = "post_content_type")
    private String postContentType;

    @Column(name = "post_status")
    private String postStatus = "publish";

    @Column(name = "post_parent")
    private UUID postParent;

    @Column(name = "post_order")
    private Integer postOrder = 0;

    @Column(name = "author_id")
    private UUID authorId;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<PostMeta> metadata = new ArrayList<>();

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

    public List<PostMeta> getMetadata() {
        return metadata;
    }

    public void setMetadata(List<PostMeta> metadata) {
        this.metadata = metadata;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
