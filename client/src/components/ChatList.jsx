import React from 'react';

const ChatList = ({ conversations, activeWaId, onSelectChat }) => {
    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const msgDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

        if (msgDate.getTime() === today.getTime()) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (msgDate.getTime() === new Date(today.setDate(today.getDate() - 1)).getTime()) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString();
        }
    };

    const getInitials = (name, waId) => {
        if (name) {
            const parts = name.split(' ');
            if (parts.length > 1) {
                return (parts[0][0] + parts[1][0]).toUpperCase();
            }
            return parts[0][0].toUpperCase();
        }
        // Fallback if name is not available, use last two digits of waId
        return waId ? waId.slice(-2) : '??';
    };

    return (
        <div className="w-full md:w-1/3 lg:w-full border-r border-gray-200 bg-white flex flex-col h-full">
            <div className="p-4 border-b border-gray-200 bg-whatsappGreen text-white">
                <h2 className="text-xl font-semibold">Chats</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
                {conversations.length === 0 ? (
                    <p className="p-4 text-gray-500">No conversations yet. Send a webhook payload to get started!</p>
                ) : (
                    conversations.map((conv) => (
                        <div
                            key={conv._id}
                            className={`flex items-center p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${activeWaId === conv._id ? 'bg-gray-100' : ''
                                }`}
                            onClick={() => onSelectChat(conv)}
                        >
                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-lg font-bold text-gray-600">
                                {getInitials(conv.userName, conv._id)}
                            </div>
                            <div className="ml-3 flex-1 min-w-0">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-md font-semibold text-whatsappText truncate">{conv.userName || `User ${conv._id}`}</h3>
                                    <span className="text-xs text-gray-500 flex-shrink-0 ml-2">{formatTime(conv.timestamp)}</span>
                                </div>
                                <p className="text-sm text-gray-500 truncate">{conv.text}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ChatList;
