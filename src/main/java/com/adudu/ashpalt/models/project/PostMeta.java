package com.adudu.ashpalt.models.project;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "post_meta", indexes = {
        @Index(name = "idx_post_meta_post_id_key", columnList = "post_id, meta_key"),
        @Index(name = "idx_post_meta_post_id", columnList = "post_id"),
        @Index(name = "idx_post_meta_key", columnList = "meta_key")
})
public class PostMeta {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false, insertable = false, updatable = false)
    private Post post;

    @NotNull(message = "Post ID cannot be null")
    @Column(name = "post_id", nullable = false)
    private UUID postId;

    @NotBlank(message = "Meta key cannot be blank")
    @Column(name = "meta_key", nullable = false, length = 255)
    private String metaKey;

    @Column(name = "meta_value", columnDefinition = "TEXT")
    private String metaValue;

    @Column(name = "meta_type", length = 50)
    private String metaType;

    @PrePersist
    protected void onCreate() {
        if (id == null) {
            id = UUID.randomUUID();
        }
        if (metaType == null) {
            metaType = "string";
        }
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Post getPost() {
        return post;
    }

    public void setPost(Post post) {
        this.post = post;
        if (post != null) {
            this.postId = post.getId();
        }
    }

    public UUID getPostId() {
        return postId;
    }

    public void setPostId(UUID postId) {
        this.postId = postId;
    }

    public String getMetaKey() {
        return metaKey;
    }

    public void setMetaKey(String metaKey) {
        this.metaKey = metaKey;
    }

    public String getMetaValue() {
        return metaValue;
    }

    public void setMetaValue(String metaValue) {
        this.metaValue = metaValue;
    }

    public String getMetaType() {
        return metaType;
    }

    public void setMetaType(String metaType) {
        this.metaType = metaType;
    }

    public UUID getValueAsUUID() {
        if (metaValue == null || metaValue.isEmpty()) {
            return null;
        }
        try {
            return UUID.fromString(metaValue);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    public LocalDateTime getValueAsLocalDateTime() {
        if (metaValue == null || metaValue.isEmpty()) {
            return null;
        }
        try {
            return LocalDateTime.parse(metaValue);
        } catch (Exception e) {
            return null;
        }
    }

    public Integer getValueAsInteger() {
        if (metaValue == null || metaValue.isEmpty()) {
            return null;
        }
        try {
            return Integer.parseInt(metaValue);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    public Boolean getValueAsBoolean() {
        if (metaValue == null || metaValue.isEmpty()) {
            return false;
        }
        return Boolean.parseBoolean(metaValue);
    }

    public void setValueFromUUID(UUID value) {
        this.metaValue = value != null ? value.toString() : null;
        this.metaType = "uuid";
    }

    public void setValueFromLocalDateTime(LocalDateTime value) {
        this.metaValue = value != null ? value.toString() : null;
        this.metaType = "date";
    }

    public void setValueFromInteger(Integer value) {
        this.metaValue = value != null ? value.toString() : null;
        this.metaType = "number";
    }

    public void setValueFromBoolean(Boolean value) {
        this.metaValue = value != null ? value.toString() : null;
        this.metaType = "boolean";
    }
}
