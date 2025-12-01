package com.adudu.ashpalt.repository.project;

import com.adudu.ashpalt.models.project.MetaType;
import com.adudu.ashpalt.models.project.PostMeta;
import jakarta.persistence.Column;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PostMetaRepository extends JpaRepository<PostMeta, UUID> {

    List<PostMeta> findByPostId(UUID postId);

    Optional<PostMeta> findByPostIdAndMetaKey(UUID postId, String metaKey);

    List<PostMeta> findByMetaKey(String metaKey);

    List<PostMeta> findByPostIdAndMetaKeyStartingWith(UUID postId, String metaKeyPrefix);

    void deleteByPostId(UUID postId);

    void deleteByPostIdAndMetaKey(UUID postId, String metaKey);

    List<PostMeta> findByPostIdIn(List<UUID> postIds);

    @Query(value = """
            SELECT pm.* 
            FROM post_meta pm
            WHERE pm.meta_key = 'calendar'
              AND  pm.meta_value::jsonb -> 'memberIds' @> CAST(('["' || :userId || '"]') AS jsonb)
            """, nativeQuery = true)
    List<PostMeta> findAssignedAgendas(@Param("userId") String userId);
}
