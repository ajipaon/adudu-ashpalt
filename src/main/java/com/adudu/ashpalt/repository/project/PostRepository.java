package com.adudu.ashpalt.repository.project;

import com.adudu.ashpalt.models.project.MetaType;
import com.adudu.ashpalt.models.project.Post;
import com.adudu.ashpalt.models.project.dto.PostmetaStatsDto;
import jakarta.persistence.Column;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
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

    @Query(value = """
    SELECT 
        p.id AS id,
        p.post_type AS postType,
        p2.title AS postParentTitle,
        p.post_title AS postTitle,
        p.post_content AS postContent,
        p.post_content_type AS postContentType,
        p.post_status AS postStatus,
        p.post_ancestor AS postParent,
        p.post_order AS postOrder,
        p.author_id AS authorId
    FROM post p
    LEFT JOIN project p2 ON p2.id = p.project_id
    JOIN post_meta pm ON pm.post_id = p.id 
       AND pm.meta_key = 'assignee'
       AND pm.meta_value = :userId
    """, nativeQuery = true)
    List<PostmetaStatsProjection> findAssignedTasks(@Param("userId") String userId);


    public interface PostmetaStatsProjection {
        UUID getId();
        String getPostType();
        String getPostParentTitle();
        String getPostTitle();
        String getPostContent();
        String getPostContentType();
        String getPostStatus();
        UUID getPostParent();
        Integer getPostOrder();
        UUID getAuthorId();
    }
}
