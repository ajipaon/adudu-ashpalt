package com.adudu.ashpalt.services.project;

import com.adudu.ashpalt.models.project.MetaType;
import com.adudu.ashpalt.models.project.PostMeta;
import com.adudu.ashpalt.repository.project.PostMetaRepository;
import com.vaadin.hilla.BrowserCallable;
import jakarta.annotation.security.PermitAll;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@BrowserCallable
@PermitAll
@Service
public class PostMetaService {

    @Autowired
    private PostMetaRepository postMetaRepository;

    public Optional<PostMeta> getMetaByKeyPrefix(UUID postId, String metaKeyPrefix) {
        return postMetaRepository.findByPostIdAndMetaKey(postId, metaKeyPrefix);
    }

    @Transactional
    public void saveMeta(PostMeta meta) {
        switch (meta.getMetaKey()) {
            case "priority":
                // memastikan meta key untuk priority hanya ada 1
                Optional<PostMeta> existingMeta = postMetaRepository.findByPostIdAndMetaKey(meta.getPostId(), meta.getMetaKey());
                if(existingMeta.isPresent()){
                    updateMeta(meta.getPostId(), meta.getMetaKey(), meta.getMetaValue());
                }

            default:
                postMetaRepository.save(meta);
        }

    }

    public List<PostMeta> getMeta(UUID taskId, String key) {
        return postMetaRepository.findByPostIdAndMetaKeyStartingWith(taskId, key);
    }

    public void updateMeta(UUID postId, String metaKey, String metaValue) {
        Optional<PostMeta> existingMeta = postMetaRepository.findByPostIdAndMetaKey(postId, metaKey);
        if (existingMeta.isPresent()) {
            PostMeta meta = existingMeta.get();
            meta.setMetaValue(metaValue);
            postMetaRepository.save(meta);
        }
    }

    @Transactional
    public void deleteMeta(UUID id) {
        postMetaRepository.deleteById(id);
    }

    @Transactional
    @Async
    protected void deleteAllMeta(UUID postId) {
        postMetaRepository.deleteByPostId(postId);
    }

    public List<PostMeta> getMeta(UUID postId) {
        return postMetaRepository.findByPostId(postId);
    }

    public List<String> getLabels(UUID taskId) {
        return getMetaByKeyPrefix(taskId, "label").stream()
                .map(PostMeta::getMetaValue)
                .collect(Collectors.toList());
    }


}
