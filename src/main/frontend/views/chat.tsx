import { ViewConfig } from '@vaadin/hilla-file-router/types.js';
import { Subscription } from '@vaadin/hilla-frontend';
import ChatMessage from 'Frontend/generated/com/adudu/ashpalt/models/ChatMessage';
import ChatRoom from 'Frontend/generated/com/adudu/ashpalt/models/ChatRoom';
import User from 'Frontend/generated/com/adudu/ashpalt/models/User';
import { ChatEndpoint } from 'Frontend/generated/endpoints';
import { useEffect, useState } from 'react';
import ChatSidebar from '../components/chat/ChatSidebar';
import ChatWindow from '../components/chat/ChatWindow';
import CreateGroupModal from '../components/chat/CreateGroupModal';

export const config: ViewConfig = {
  menu: {
    order: 4,
    icon: 'line-awesome/svg/comments.svg',
  },
  title: 'Chat',
};

export default function ChatView() {
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [subscription, setSubscription] = useState<Subscription<ChatMessage> | null>(null);

  useEffect(() => {
    refreshRooms();
    refreshUnreadCounts();
    ChatEndpoint.getAllUsers().then(setUsers);

    const globalSub = ChatEndpoint.joinUserUpdates().onNext((msg) => {
      refreshUnreadCounts();
      refreshRooms();
    });

    return () => globalSub.cancel();
  }, []);

  useEffect(() => {
    if (selectedRoom) {
      ChatEndpoint.getMessages(selectedRoom.id!).then((msgs) => {
        setMessages(msgs);
        refreshUnreadCounts();
      });
      if (subscription) {
        subscription.cancel();
      }

      console.log('Subscribing to room:', selectedRoom.id);
      const sub = ChatEndpoint.joinLiveChat(selectedRoom.id!)
        .onNext((msg) => {
          console.log('Received message:', msg);
          setMessages((prev) => [...prev, msg]);
          if (msg.sender?.id !== selectedRoom.id) {
            refreshUnreadCounts();
          }
        })
        .onError((err) => console.error('Subscription error:', err))
        .onComplete(() => console.log('Subscription completed'));

      setSubscription(sub);
    }

    return () => {
      if (subscription) {
        subscription.cancel();
      }
    };
  }, [selectedRoom?.id]);

  const refreshRooms = () => {
    ChatEndpoint.getRooms().then(setRooms);
  };

  const refreshUnreadCounts = () => {
    ChatEndpoint.getUnreadCounts().then(setUnreadCounts);
  };

  const handleSelectUser = async (user: User) => {
    const room = await ChatEndpoint.createPrivateRoom(user.id!);
    await refreshRooms();
    setSelectedRoom(room);
  };

  const handleSendMessage = async (content: string) => {
    if (selectedRoom) {
      await ChatEndpoint.sendMessage(selectedRoom.id!, content);
    }
  };

  const handleCreateGroup = async (name: string, userIds: string[]) => {
    await ChatEndpoint.createGroupRoom(name, userIds);
    refreshRooms();
  };

  return (
    <div className="flex h-full w-full overflow-hidden">
      <ChatSidebar
        rooms={rooms}
        users={users}
        unreadCounts={unreadCounts}
        selectedRoomId={selectedRoom?.id}
        onSelectRoom={setSelectedRoom}
        onSelectUser={handleSelectUser}
        onCreateGroup={() => setIsCreateGroupOpen(true)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {selectedRoom ? (
          <ChatWindow room={selectedRoom} messages={messages} onSendMessage={handleSendMessage} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a chat to start messaging
          </div>
        )}
      </div>

      <CreateGroupModal
        opened={isCreateGroupOpen}
        onClose={() => setIsCreateGroupOpen(false)}
        onCreate={handleCreateGroup}
      />
    </div>
  );
}
