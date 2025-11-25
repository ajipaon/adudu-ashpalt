package com.adudu.ashpalt.services;

import com.adudu.ashpalt.models.ChatMessage;
import com.adudu.ashpalt.models.ChatRoom;
import com.adudu.ashpalt.models.User;
import com.adudu.ashpalt.repository.UserRepository;
import com.adudu.ashpalt.security.AuthenticatedUser;

import com.vaadin.hilla.BrowserCallable;
import jakarta.annotation.security.PermitAll;
import reactor.core.publisher.Flux;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@BrowserCallable
@PermitAll
public class ChatEndpoint {

    private final ChatService chatService;
    private final AuthenticatedUser authenticatedUser;
    private final UserRepository userRepository;

    public ChatEndpoint(ChatService chatService, AuthenticatedUser authenticatedUser, UserRepository userRepository) {
        this.chatService = chatService;
        this.authenticatedUser = authenticatedUser;
        this.userRepository = userRepository;
    }

    public List<ChatRoom> getRooms() {
        User user = getAuthenticatedUser();
        return chatService.getUserRooms(user.getId());
    }

    public List<ChatMessage> getMessages(UUID roomId) {
        User user = getAuthenticatedUser();
        return chatService.getMessages(roomId, user.getId());
    }

    public ChatMessage sendMessage(UUID roomId, String content) {
        User user = getAuthenticatedUser();
        return chatService.sendMessage(roomId, user.getId(), content);
    }

    public ChatRoom createPrivateRoom(UUID otherUserId) {
        User user = getAuthenticatedUser();
        return chatService.createPrivateRoom(user.getId(), otherUserId);
    }

    public ChatRoom createGroupRoom(String name, Set<UUID> participantIds) {
        User user = getAuthenticatedUser();
        participantIds.add(user.getId());
        return chatService.createGroupRoom(name, participantIds);
    }

    public Flux<ChatMessage> joinLiveChat(UUID roomId) {
        return chatService.joinLiveChat(roomId);
    }

    public Flux<ChatMessage> joinUserUpdates() {
        User user = getAuthenticatedUser();
        return chatService.joinUserUpdates(user.getId());
    }

    public Map<UUID, Long> getUnreadCounts() {
        User user = getAuthenticatedUser();
        return chatService.getUnreadCounts(user.getId());
    }

    public void markAsRead(UUID messageId) {
        User user = getAuthenticatedUser();
        chatService.markMessageAsRead(messageId, user.getId());
    }

    public List<User> getAllUsers() {
        User currentUser = getAuthenticatedUser();
        return userRepository.findAll().stream()
                .filter(user -> !user.getId().equals(currentUser.getId()))
                .toList();
    }

    private User getAuthenticatedUser() {
        return authenticatedUser.get()
                .map(userDetails -> userRepository.findByUsername(userDetails.getUsername()).orElseThrow())
                .orElseThrow(() -> new IllegalStateException("User not authenticated"));
    }
}
