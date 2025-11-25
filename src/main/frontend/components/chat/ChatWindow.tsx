import { MessageInput, MessageList, MessageListItem } from '@vaadin/react-components';
import ChatMessage from 'Frontend/generated/com/adudu/ashpalt/models/ChatMessage';
import ChatRoom from 'Frontend/generated/com/adudu/ashpalt/models/ChatRoom';
import { useEffect, useState } from 'react';
import { useAuth } from 'Frontend/util/auth';
import User from 'Frontend/generated/com/adudu/ashpalt/models/User';

interface ChatWindowProps {
    room: ChatRoom;
    messages: ChatMessage[];
    onSendMessage: (content: string) => void;
}

export default function ChatWindow({ room, messages, onSendMessage }: ChatWindowProps) {
    const { state } = useAuth();
    const [items, setItems] = useState<MessageListItem[]>([]);

    const getStatusIcon = (status?: string) => {
        switch (status) {
            case 'SENT': return '✓';
            case 'DELIVERED': return '✓✓';
            case 'READ': return '✓✓ (Read)';
            case 'PARTIALLY_READ': return '✓✓ (Partial)';
            default: return '';
        }
    };

    useEffect(() => {
        setItems(messages.map(msg => {
            const user = state.user as unknown as User;
            const isOwn = msg.sender?.id === user?.id;
            // @ts-ignore
            const statusIcon = msg.sender?.id === user?.id ? getStatusIcon(msg.status) : '';
            return {
                text: msg.content,
                time: `${msg.sentAt ? new Date(msg.sentAt).toLocaleTimeString() : ''} ${statusIcon}`,
                userName: msg.sender?.name || msg.sender?.username || 'Unknown',
                userColorIndex: (msg.sender?.name?.length || 0) % 7,
                className: `rounded-xl p-3 mb-3 shadow-sm max-w-[80%] w-fit ${isOwn? "bg-gray-100 self-end": "bg-blue-100 self-start"}`
            };
        }));
    }, [messages, state.user]);

    return (
        <div
            className="flex flex-col h-full w-full"
            style={{
                backgroundImage: 'url(/images/photo-background-1.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
            }}
        >
            <div className="p-4 border-b bg-gray-200 shadow-sm z-10">
                <h3 className="text-lg font-semibold text-gray-800">{room.name}</h3>
                <span className="text-sm text-gray-500">
                    {room.type === 'GROUP' ? 'Group Chat' : 'Private Chat'}
                </span>
            </div>

            <div className="flex-1 overflow-hidden relative mt-5 ">
                <MessageList
                    items={items}
                    className="p-4 box-border mx-3"
                />
            </div>

            <div className="p-4  border-t bg-gray-200">
                <MessageInput
                    onSubmit={(e) => onSendMessage(e.detail.value)}
                    className="w-full"
                />
            </div>
        </div>
    );
}
