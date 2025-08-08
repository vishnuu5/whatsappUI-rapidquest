import React, { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import SendMessageForm from './SendMessageForm';
import { ArrowLeft } from 'lucide-react';

const ChatWindow = ({ activeWaId, activeUserName, messages, onSendMessage, onBack }) => {
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const getInitials = (name, waId) => {
        if (name) {
            const parts = name.split(' ');
            if (parts.length > 1) {
                return (parts[0][0] + parts[1][0]).toUpperCase();
            }
            return parts[0][0].toUpperCase();
        }
        return waId ? waId.slice(-2) : '??';
    };

    if (!activeWaId) {
        return (
            <div className="flex-1 flex items-center justify-center bg-whatsappBackground text-gray-500 text-lg">
                Select a chat to start messaging
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-whatsappBackground h-full">
            <div className="p-4 border-b border-gray-200 bg-whatsappGreen text-white flex items-center">
                <button
                    onClick={onBack}
                    className="mr-3 md:hidden text-white focus:outline-none"
                    aria-label="Back to chats"
                >
                    <ArrowLeft size={24} />
                </button>

                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-md font-bold text-gray-600">
                    {getInitials(activeUserName, activeWaId)}
                </div>
                <div className="ml-3">
                    <h2 className="text-lg font-semibold">{activeUserName || `User ${activeWaId}`}</h2>
                    <p className="text-sm text-gray-200">{activeWaId}</p>
                </div>
            </div>

            <div className="flex-1 p-4 overflow-y-auto flex flex-col">
                {messages.map((message) => (
                    <MessageBubble key={message.message_id || message.clientMessageId} message={message} />
                ))}
                <div ref={messagesEndRef} />
            </div>

            <SendMessageForm onSendMessage={onSendMessage} />
        </div>
    );
};

export default ChatWindow;
