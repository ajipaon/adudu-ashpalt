package com.adudu.ashpalt.services;

import com.adudu.ashpalt.models.*;
import com.adudu.ashpalt.repository.ChatMessageRepository;
import com.adudu.ashpalt.repository.ChatParticipantRepository;
import com.adudu.ashpalt.repository.ChatRoomRepository;
import com.adudu.ashpalt.repository.UserRepository;
import com.adudu.ashpalt.repository.ChatMessageStatusRepository; // Added import
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Sinks;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class ChatService {

    private final ChatRoomRepository chatRoomRepository;
    private final ChatParticipantRepository chatParticipantRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;
    private final ChatMessageStatusRepository chatMessageStatusRepository;

    private final Map<UUID, Sinks.Many<ChatMessage>> roomSinks = new ConcurrentHashMap<>();
    private final Map<UUID, Sinks.Many<ChatMessage>> userSinks = new ConcurrentHashMap<>();

    public ChatService(ChatRoomRepository chatRoomRepository,
            ChatParticipantRepository chatParticipantRepository,
            ChatMessageRepository chatMessageRepository,
            UserRepository userRepository,
            ChatMessageStatusRepository chatMessageStatusRepository) {
        this.chatRoomRepository = chatRoomRepository;
        this.chatParticipantRepository = chatParticipantRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.userRepository = userRepository;
        this.chatMessageStatusRepository = chatMessageStatusRepository;
    }

    @Transactional
    public ChatRoom createPrivateRoom(UUID userId1, UUID userId2) {

        System.out.println("Creating/Finding private room for " + userId1 + " and " + userId2);
        User user1 = userRepository.findById(userId1).orElseThrow();
        User user2 = userRepository.findById(userId2).orElseThrow();

        List<ChatParticipant> user1Participants = chatParticipantRepository.findByUser(user1);
        for (ChatParticipant p1 : user1Participants) {
            if (p1.getChatRoom().getType() == ChatRoomType.PRIVATE) {
                List<ChatParticipant> roomParticipants = chatParticipantRepository.findByChatRoom(p1.getChatRoom());
                if (roomParticipants.size() == 2
                        && roomParticipants.stream().anyMatch(p -> p.getUser().getId().equals(userId2))) {
                    System.out.println("Found existing room: " + p1.getChatRoom().getId());
                    return p1.getChatRoom();
                }
            }
        }

        ChatRoom room = new ChatRoom();
        room.setType(ChatRoomType.PRIVATE);
        room.setName(user1.getName() + " & " + user2.getName());
        room = chatRoomRepository.save(room);
        System.out.println("Created new room: " + room.getId());

        addParticipant(room, user1);
        addParticipant(room, user2);

        return room;
    }

    @Transactional
    public ChatRoom createGroupRoom(String name, Set<UUID> userIds) {
        ChatRoom room = new ChatRoom();
        room.setType(ChatRoomType.GROUP);
        room.setName(name);
        room = chatRoomRepository.save(room);

        for (UUID userId : userIds) {
            User user = userRepository.findById(userId).orElseThrow();
            addParticipant(room, user);
        }

        return room;
    }

    private void addParticipant(ChatRoom room, User user) {
        ChatParticipant participant = new ChatParticipant();
        participant.setChatRoom(room);
        participant.setUser(user);
        chatParticipantRepository.save(participant);
    }

    @Transactional
    public ChatMessage sendMessage(UUID roomId, UUID senderId, String content) {
        System.out.println("Sending message to room: " + roomId);
        ChatRoom room = chatRoomRepository.findById(roomId).orElseThrow();
        User sender = userRepository.findById(senderId).orElseThrow();

        ChatMessage message = new ChatMessage();
        message.setChatRoom(room);
        message.setSender(sender);
        message.setContent(content);
        message = chatMessageRepository.save(message);

        List<ChatParticipant> participants = chatParticipantRepository.findByChatRoom(room);
        for (ChatParticipant p : participants) {
            if (!p.getUser().getId().equals(senderId)) {
                ChatMessageStatus status = new ChatMessageStatus();
                status.setMessage(message);
                status.setUser(p.getUser());
                status.setStatus(MessageStatus.SENT);
                chatMessageStatusRepository.save(status);

                Sinks.Many<ChatMessage> userSink = userSinks.get(p.getUser().getId());
                if (userSink != null) {
                    userSink.tryEmitNext(message);
                }
            }
        }

        Sinks.Many<ChatMessage> sink = roomSinks.computeIfAbsent(roomId, k -> {
            System.out.println("Creating new sink for room (in sendMessage): " + k);
            return Sinks.many().replay().limit(50);
        });

        Sinks.EmitResult result = sink.tryEmitNext(message);
        System.out.println("Emitted message result: " + result);

        return message;
    }

    public Flux<ChatMessage> joinUserUpdates(UUID userId) {
        return userSinks.computeIfAbsent(userId, k -> Sinks.many().multicast().onBackpressureBuffer()).asFlux();
    }

    @Transactional
    public void markMessageAsRead(UUID messageId, UUID userId) {
        ChatMessage message = chatMessageRepository.findById(messageId).orElseThrow();
        User user = userRepository.findById(userId).orElseThrow();

        Optional<ChatMessageStatus> statusOpt = chatMessageStatusRepository.findByMessageAndUser(message, user);
        if (statusOpt.isPresent()) {
            ChatMessageStatus status = statusOpt.get();
            if (status.getStatus() != MessageStatus.READ) {
                status.setStatus(MessageStatus.READ);
                chatMessageStatusRepository.save(status);
            }
        }
    }

    public Map<UUID, Long> getUnreadCounts(UUID userId) {
        User user = userRepository.findById(userId).orElseThrow();
        List<ChatRoom> rooms = getUserRooms(userId);
        Map<UUID, Long> counts = new HashMap<>();

        for (ChatRoom room : rooms) {
            long count = chatMessageStatusRepository.countByMessageChatRoomAndUserAndStatusNot(room, user,
                    MessageStatus.READ);
            if (count > 0) {
                counts.put(room.getId(), count);
            }
        }
        return counts;
    }

    public List<ChatMessageStatus> getMessageStatuses(UUID messageId) {
        ChatMessage message = chatMessageRepository.findById(messageId).orElseThrow();
        return chatMessageStatusRepository.findByMessage(message);
    }

    public List<ChatMessage> getMessages(UUID roomId, UUID userId) {
        ChatRoom room = chatRoomRepository.findById(roomId).orElseThrow();
        List<ChatMessage> messages = chatMessageRepository.findByChatRoomOrderBySentAtAsc(room);

        for (ChatMessage msg : messages) {
            if (msg.getSender().getId().equals(userId)) {
                List<ChatMessageStatus> statuses = chatMessageStatusRepository.findByMessage(msg);
                if (statuses.isEmpty()) {
                    msg.setStatus(MessageStatus.SENT);
                } else {
                    boolean allRead = statuses.stream().allMatch(s -> s.getStatus() == MessageStatus.READ);
                    boolean anyRead = statuses.stream().anyMatch(s -> s.getStatus() == MessageStatus.READ);

                    if (allRead) {
                        msg.setStatus(MessageStatus.READ);
                    } else if (anyRead) {
                        msg.setStatus(MessageStatus.PARTIALLY_READ);
                    } else {
                        msg.setStatus(MessageStatus.SENT);
                    }
                }
            } else {
                msg.setStatus(MessageStatus.READ);
                markMessageAsRead(msg.getId(), userId);
            }
        }

        return messages;
    }

    public List<ChatRoom> getUserRooms(UUID userId) {
        User user = userRepository.findById(userId).orElseThrow();
        return chatParticipantRepository.findByUser(user).stream()
                .map(ChatParticipant::getChatRoom)
                .collect(Collectors.toList());
    }

    public Flux<ChatMessage> joinLiveChat(UUID roomId) {
        System.out.println("User joining live chat for room: " + roomId);
        return roomSinks.computeIfAbsent(roomId, k -> {
            System.out.println("Creating new sink for room (in joinLiveChat): " + k);
            return Sinks.many().replay().limit(50);
        }).asFlux()
                .doOnCancel(() -> System.out.println("Subscription cancelled for room: " + roomId));
    }
}
