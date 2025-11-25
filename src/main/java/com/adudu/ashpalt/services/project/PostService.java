package com.adudu.ashpalt.services.project;

import com.adudu.ashpalt.models.project.Post;
import com.adudu.ashpalt.models.project.PostMeta;
import com.adudu.ashpalt.repository.project.PostMetaRepository;
import com.adudu.ashpalt.repository.project.PostRepository;
import com.adudu.ashpalt.security.AuthenticatedUser;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.vaadin.flow.server.auth.AnonymousAllowed;
import com.vaadin.hilla.BrowserCallable;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@BrowserCallable
@AnonymousAllowed
public class PostService {

    @Autowired
    private AuthenticatedUser authenticatedUser;

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private PostMetaRepository postMetaRepository;

    @Autowired
    private ObjectMapper objectMapper;

    public Post createPost(Post post) {
        if (post.getCreatedAt() == null) {
            post.setCreatedAt(LocalDateTime.now());
        }
        post.setUpdatedAt(LocalDateTime.now());
        post.setAuthorId(authenticatedUser.getUserId());
        return postRepository.save(post);
    }

    public Post updatePost(Post post) {
        post.setUpdatedAt(LocalDateTime.now());
        return postRepository.save(post);
    }

    public void deletePost(UUID postId) {
        List<Post> children = postRepository.findByPostParent(postId);
        for (Post child : children) {
            deletePost(child.getId());
        }
        postRepository.deleteById(postId);
    }

    public Optional<Post> getPostById(UUID postId) {
        return postRepository.findById(postId);
    }

    public List<Post> getAllPosts() {
        return postRepository.findAll();
    }

    public List<Post> getPostsByType(String postType) {
        return postRepository.findByPostTypeOrderByPostOrder(postType);
    }

    public List<Post> getPostsByParent(UUID parentId) {
        return postRepository.findByPostParentOrderByPostOrder(parentId);
    }

    public List<Post> getPostsByTypeAndParent(String postType, UUID parentId) {
        return postRepository.findByPostTypeAndPostParentOrderByPostOrder(postType, parentId);
    }

    public List<Post> getProjects() {
        return getPostsByType("project");
    }

    public List<Post> getColumnsByProject(UUID projectId) {
        return getPostsByTypeAndParent("column", projectId);
    }

    public List<Post> getTasksByColumn(UUID columnId) {
        return getPostsByTypeAndParent("task", columnId);
    }

    public List<Post> getChecklistItemsByTask(UUID taskId) {
        return getPostsByTypeAndParent("checklist_item", taskId);
    }

    @Transactional
    public void updatePostOrder(UUID postId, Integer newOrder) {
        Optional<Post> postOpt = postRepository.findById(postId);
        if (postOpt.isPresent()) {
            Post post = postOpt.get();
            post.setPostOrder(newOrder);
            postRepository.save(post);
        }
    }

    @Transactional
    public void reorderPosts(List<UUID> postIds) {
        for (int i = 0; i < postIds.size(); i++) {
            updatePostOrder(postIds.get(i), i);
        }
    }

    public PostMeta addMeta(UUID postId, String metaKey, String metaValue, String metaType) {
        PostMeta meta = new PostMeta();
        meta.setPostId(postId);
        meta.setMetaKey(metaKey);
        meta.setMetaValue(metaValue);
        meta.setMetaType(metaType);
        return postMetaRepository.save(meta);
    }

    public List<PostMeta> getMeta(UUID postId) {
        return postMetaRepository.findByPostId(postId);
    }

    public Optional<PostMeta> getMetaByKey(UUID postId, String metaKey) {
        return postMetaRepository.findByPostIdAndMetaKey(postId, metaKey);
    }

    public List<PostMeta> getMetaByKeyPrefix(UUID postId, String metaKeyPrefix) {
        return postMetaRepository.findByPostIdAndMetaKeyStartingWith(postId, metaKeyPrefix);
    }

    public void updateMeta(UUID postId, String metaKey, String metaValue) {
        Optional<PostMeta> existingMeta = postMetaRepository.findByPostIdAndMetaKey(postId, metaKey);
        if (existingMeta.isPresent()) {
            PostMeta meta = existingMeta.get();
            meta.setMetaValue(metaValue);
            postMetaRepository.save(meta);
        } else {
            addMeta(postId, metaKey, metaValue, "string");
        }
    }

    @Transactional
    public void deleteMeta(UUID postId, String metaKey) {
        postMetaRepository.deleteByPostIdAndMetaKey(postId, metaKey);
    }

    @Transactional
    public void deleteAllMeta(UUID postId) {
        postMetaRepository.deleteByPostId(postId);
    }

    public void addLabel(UUID taskId, String label) {
        addMeta(taskId, "label", label, "string");
    }

    public List<String> getLabels(UUID taskId) {
        return getMetaByKeyPrefix(taskId, "label").stream()
                .map(PostMeta::getMetaValue)
                .collect(Collectors.toList());
    }

    public void setAssignee(UUID taskId, UUID assigneeId) {
        Optional<PostMeta> existingMeta = postMetaRepository.findByPostIdAndMetaKey(taskId, "assignee");
        if (existingMeta.isPresent()) {
            PostMeta meta = existingMeta.get();
            meta.setValueFromUUID(assigneeId);
            postMetaRepository.save(meta);
        } else {
            PostMeta meta = new PostMeta();
            meta.setPostId(taskId);
            meta.setMetaKey("assignee");
            meta.setValueFromUUID(assigneeId);
            postMetaRepository.save(meta);
        }
    }

    public Optional<UUID> getAssignee(UUID taskId) {
        return getMetaByKey(taskId, "assignee")
                .map(PostMeta::getValueAsUUID);
    }

    public void setDueDate(UUID taskId, LocalDateTime dueDate) {
        Optional<PostMeta> existingMeta = postMetaRepository.findByPostIdAndMetaKey(taskId, "due_date");
        if (existingMeta.isPresent()) {
            PostMeta meta = existingMeta.get();
            meta.setValueFromLocalDateTime(dueDate);
            postMetaRepository.save(meta);
        } else {
            PostMeta meta = new PostMeta();
            meta.setPostId(taskId);
            meta.setMetaKey("due_date");
            meta.setValueFromLocalDateTime(dueDate);
            postMetaRepository.save(meta);
        }
    }

    public Optional<LocalDateTime> getDueDate(UUID taskId) {
        return getMetaByKey(taskId, "due_date")
                .map(PostMeta::getValueAsLocalDateTime);
    }

    public void addAttachment(UUID taskId, String attachmentPath) {
        addMeta(taskId, "attachment", attachmentPath, "string");
    }

    public List<String> getAttachments(UUID taskId) {
        return getMetaByKeyPrefix(taskId, "attachment").stream()
                .map(PostMeta::getMetaValue)
                .collect(Collectors.toList());
    }

    public void setCoverImage(UUID taskId, String imagePath) {
        updateMeta(taskId, "cover_image", imagePath);
    }

    public Optional<String> getCoverImage(UUID taskId) {
        return getMetaByKey(taskId, "cover_image")
                .map(PostMeta::getMetaValue);
    }

    public void setLabels(UUID taskId, List<String> labels) {
        postMetaRepository.deleteByPostIdAndMetaKey(taskId, "label");

        for (String label : labels) {
            addLabel(taskId, label);
        }
    }

    @Async
    protected void updateTaskParentDefault(UUID parentId, UUID targetPostParentId) {
        List<Post> posts = postRepository.findByPostTypeAndPostParent("task", parentId);

        if (posts.isEmpty()) {
            return;
        }

        if (targetPostParentId == null) {
            postRepository.deleteAll(posts);
            return;
        }
        List<Post> listColumn = getColumnsByProject(targetPostParentId);
        if (listColumn.isEmpty()) {
            postRepository.deleteAll(posts);
            return;
        }
        Post targetPostParent = listColumn.getFirst();
        if (parentId == targetPostParent.getId()) {
            postRepository.deleteAll(posts);
            return;
        }
        for (Post post : posts) {
            post.setPostParent(targetPostParent.getId());
            postRepository.save(post);
        }

    }

}
