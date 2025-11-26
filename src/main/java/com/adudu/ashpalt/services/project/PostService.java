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
public class PostService {

    @Autowired
    private AuthenticatedUser authenticatedUser;

    @Autowired
    private PostRepository postRepository;


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
