package com.adudu.ashpalt.repository.project;

import com.adudu.ashpalt.models.project.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PostRepository extends JpaRepository<Post, UUID> {

    List<Post> findByPostType(String postType);

    List<Post> findByPostParent(UUID parentId);

    List<Post> findByPostTypeAndPostParent(String postType, UUID parentId);

    List<Post> findByPostTypeOrderByPostOrder(String postType);

    List<Post> findByPostParentOrderByPostOrder(UUID parentId);

    List<Post> findByPostTypeAndPostParentOrderByPostOrder(String postType, UUID parentId);

    List<Post> findByPostStatus(String status);

    List<Post> findByPostTypeAndPostStatus(String postType, String status);

    List<Post> findByAuthorId(UUID authorId);
}
