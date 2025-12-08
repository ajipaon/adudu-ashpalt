package com.adudu.ashpalt.services.note;

import com.adudu.ashpalt.models.note.Note;
import com.adudu.ashpalt.repository.note.NoteRepository;
import com.adudu.ashpalt.security.AuthenticatedUser;
import com.vaadin.hilla.BrowserCallable;
import jakarta.annotation.security.PermitAll;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@BrowserCallable
@PermitAll
@Service
public class NoteService {

    @Autowired
    private NoteRepository noteRepository;

    @Autowired
    private AuthenticatedUser authenticatedUser;

    public Note createNote(CreateNoteRequest request) {

        Note note = new Note();
        String title = request.getTitle();
        if (title == null || title.trim().isEmpty()) {
            title = "Untitled Note";
        }
        note.setTitle(title);
        note.setContent(request.getContent());
        note.setAuthor(authenticatedUser.getUserId());
        note.setPublic(request.isPublic());

        return noteRepository.save(note);

    }

    public Optional<Note> getNoteById(UUID id) {
        return noteRepository.findById(id);
    }

    public List<Note> getAllNotes() {
        return noteRepository.findAll();
    }

    public List<Note> getNotesByAuthor(UUID author) {
        return noteRepository.findByAuthor(author);
    }

    public Note updateNote(UUID id, CreateNoteRequest request) {
        Optional<Note> optionalNote = noteRepository.findById(id);
        if (optionalNote.isPresent()) {
            Note note = optionalNote.get();
            note.setTitle(request.getTitle());
            note.setContent(request.getContent());
            note.setPublic(request.isPublic());
            note.setUpdatedAt(LocalDateTime.now());

            return noteRepository.save(note);
        }
        return null;
    }

    public void deleteNote(UUID id) {
        noteRepository.deleteById(id);
    }

    public Note addTeamShare(UUID noteId, UUID userId, UUID teamId) {
        Optional<Note> optionalNote = noteRepository.findById(noteId);
        if (optionalNote.isPresent()) {
            Note note = optionalNote.get();
            note.setUpdatedAt(LocalDateTime.now());
            // return noteRepository.save(note);
        }
        return null;
    }

    public static class CreateNoteRequest {
        private String title;
        private String content;
        private boolean isPublic;

        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getContent() {
            return content;
        }

        public void setContent(String content) {
            this.content = content;
        }

        public boolean isPublic() {
            return isPublic;
        }

        public void setPublic(boolean aPublic) {
            isPublic = aPublic;
        }

    }

    public static class ShareNoteRequest {
        private Long noteId;
        private List<String> teamIds;

        public Long getNoteId() {
            return noteId;
        }

        public void setNoteId(Long noteId) {
            this.noteId = noteId;
        }

        public List<String> getTeamIds() {
            return teamIds;
        }

        public void setTeamIds(List<String> teamIds) {
            this.teamIds = teamIds;
        }
    }

}
