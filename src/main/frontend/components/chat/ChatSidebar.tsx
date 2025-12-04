import { Avatar, Button, Icon, Tab, Tabs } from '@vaadin/react-components';
import ChatRoom from 'Frontend/generated/com/adudu/ashpalt/models/ChatRoom';
import ChatRoomType from 'Frontend/generated/com/adudu/ashpalt/models/ChatRoomType';
import User from 'Frontend/generated/com/adudu/ashpalt/models/User';
import { useState } from 'react';

interface ChatSidebarProps {
  rooms: ChatRoom[];
  users: User[];
  unreadCounts: Record<string, number>;
  selectedRoomId?: string;
  onSelectRoom: (room: ChatRoom) => void;
  onSelectUser: (user: User) => void;
  onCreateGroup: () => void;
}

export default function ChatSidebar({
  rooms,
  users,
  unreadCounts,
  selectedRoomId,
  onSelectRoom,
  onSelectUser,
  onCreateGroup,
}: ChatSidebarProps) {
  const [tab, setTab] = useState(0);

  return (
    <div className="flex flex-col h-full bg-gray-50 border-r border-gray-200 w-80">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Chats</h2>
        <Button theme="tertiary-inline" onClick={onCreateGroup}>
          <Icon icon="vaadin:plus" />
        </Button>
      </div>

      <Tabs selected={tab} onSelectedChanged={(e) => setTab(e.detail.value)} className="w-full">
        <Tab>Chats</Tab>
        <Tab>Users</Tab>
      </Tabs>

      <div className="flex-1 overflow-y-auto">
        {tab === 0
          ? rooms.map((room) => (
              <div
                key={room.id}
                onClick={() => onSelectRoom(room)}
                className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-100 transition-colors ${
                  selectedRoomId === room.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                }`}
              >
                <Avatar
                  theme="small"
                  name={room.name}
                  className={
                    room.type === ChatRoomType.GROUP
                      ? 'bg-indigo-100 text-indigo-600'
                      : 'bg-green-100 text-green-600'
                  }
                />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <div className="font-medium text-gray-900 truncate">{room.name}</div>
                    {unreadCounts[room.id!] > 0 && (
                      <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {unreadCounts[room.id!]}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {room.type === ChatRoomType.GROUP ? 'Group' : 'Private'}
                  </div>
                </div>
              </div>
            ))
          : users.map((user) => (
              <div
                key={user.id}
                onClick={() => onSelectUser(user)}
                className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <Avatar theme="small" name={user.username} className="bg-gray-200 text-gray-600" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">{user.username}</div>
                </div>
              </div>
            ))}
      </div>
    </div>
  );
}
