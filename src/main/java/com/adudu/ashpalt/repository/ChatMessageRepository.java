package com.adudu.ashpalt.repository;

import com.adudu.ashpalt.models.ChatMessage;
import com.adudu.ashpalt.models.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, UUID> {
    List<ChatMessage> findByChatRoomOrderBySentAtAsc(ChatRoom chatRoom);
}
