package com.adudu.ashpalt.repository.project;

import com.adudu.ashpalt.models.project.PostMeta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

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
}
