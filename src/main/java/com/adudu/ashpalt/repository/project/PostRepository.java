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
                p1.post_title as columnStatus,
                p2.title AS postParentTitle,
                p2.id as postProjectId,
                p.post_title AS postTitle,
                p.post_content AS postContent,
                p.post_content_type AS postContentType,
                p.post_status AS postStatus,
                p.post_ancestor AS postParent,
                p.post_order AS postOrder,
                p.author_id AS authorId
            FROM post p
            LEFT JOIN post p1 ON p1.id = p.post_parent
            LEFT JOIN project p2 ON p2.id = p.project_id
            JOIN post_meta pm ON pm.post_id = p.id
               AND pm.meta_key = 'assignee'
               AND pm.meta_value = :userId
            """, nativeQuery = true)
    List<PostmetaStatsProjection> findAssignedTasks(@Param("userId") String userId);

    public interface PostmetaStatsProjection {
        UUID getId();

        String getPostType();

        String getColumnStatus();

        String getPostParentTitle();

        UUID getPostProjectId();

        String getPostTitle();

        String getPostContent();

        String getPostContentType();

        String getPostStatus();

        UUID getPostParent();

        Integer getPostOrder();

        UUID getAuthorId();
    }

    @Query("SELECT COUNT(p) FROM Post p WHERE p.postType = :postType AND p.projectId = :projectId AND p.updatedAt >= :since")
    long countByPostTypeAndProjectIdAndUpdatedAtAfter(@Param("postType") String postType,
            @Param("projectId") UUID projectId, @Param("since") LocalDateTime since);

    @Query("SELECT COUNT(p) FROM Post p WHERE p.postType = :postType AND p.projectId = :projectId AND p.createdAt >= :since")
    long countByPostTypeAndProjectIdAndCreatedAtAfter(@Param("postType") String postType,
            @Param("projectId") UUID projectId, @Param("since") LocalDateTime since);

    @Query("SELECT COUNT(p) FROM Post p WHERE p.postType = 'task' AND p.projectId = :projectId AND p.postParent IN (SELECT c.id FROM Post c WHERE c.postTitle = 'Done' AND c.projectId = :projectId) AND p.updatedAt >= :since")
    long countCompletedTasks(@Param("projectId") UUID projectId, @Param("since") LocalDateTime since);

    @Query("SELECT c.postTitle as status, COUNT(p) as count FROM Post p JOIN Post c ON p.postParent = c.id WHERE p.postType = 'task' AND p.projectId = :projectId GROUP BY c.postTitle")
    List<Object[]> countTasksByStatus(@Param("projectId") UUID projectId);

    @Query("SELECT p.postType as type, COUNT(p) as count FROM Post p WHERE p.projectId = :projectId GROUP BY p.postType")
    List<Object[]> countPostsByType(@Param("projectId") UUID projectId);

    @Query(value = "SELECT pm.meta_value as priority, COUNT(p.id) as count FROM post p JOIN post_meta pm ON p.id = pm.post_id WHERE p.post_type = 'task' AND p.project_id = :projectId AND pm.meta_key = 'priority' GROUP BY pm.meta_value", nativeQuery = true)
    List<Object[]> countTasksByPriority(@Param("projectId") UUID projectId);

    @Query(value = "SELECT COUNT(p.id) FROM post p JOIN post_meta pm ON p.id = pm.post_id WHERE p.post_type = 'task' AND p.project_id = :projectId AND pm.meta_key = 'dueDate' AND CAST(pm.meta_value AS TIMESTAMP) BETWEEN :start AND :end", nativeQuery = true)
    long countDueSoonTasks(@Param("projectId") UUID projectId, @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);
}
