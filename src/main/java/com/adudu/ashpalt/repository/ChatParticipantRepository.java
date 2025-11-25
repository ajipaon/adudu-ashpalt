package com.adudu.ashpalt.repository;

import com.adudu.ashpalt.models.ChatParticipant;
import com.adudu.ashpalt.models.ChatRoom;
import com.adudu.ashpalt.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ChatParticipantRepository extends JpaRepository<ChatParticipant, UUID> {
    List<ChatParticipant> findByUser(User user);

    List<ChatParticipant> findByChatRoom(ChatRoom chatRoom);
}
