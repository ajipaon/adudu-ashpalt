package com.adudu.ashpalt.repository.note;

import com.adudu.ashpalt.models.note.Note;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;


import java.util.List;
import java.util.UUID;

public interface NoteRepository extends JpaRepository<Note, UUID> , JpaSpecificationExecutor<Note> {

    List<Note> findByAuthor(String author);

    List<Note> findNoteByIsPublic(boolean isPublic, Pageable pageable);
}
