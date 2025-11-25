package com.adudu.ashpalt.repository;

import com.adudu.ashpalt.models.ChatMessage;
import com.adudu.ashpalt.models.ChatMessageStatus;
import com.adudu.ashpalt.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import com.adudu.ashpalt.models.ChatRoom;
import com.adudu.ashpalt.models.MessageStatus;

@Repository
public interface ChatMessageStatusRepository extends JpaRepository<ChatMessageStatus, UUID> {
    List<ChatMessageStatus> findByMessage(ChatMessage message);

    Optional<ChatMessageStatus> findByMessageAndUser(ChatMessage message, User user);

    long countByUserAndStatus(User user, MessageStatus status);

    long countByMessageChatRoomAndUserAndStatus(ChatRoom chatRoom, User user, MessageStatus status);

    long countByMessageChatRoomAndUserAndStatusNot(ChatRoom chatRoom, User user, MessageStatus status);
}
