import React, { useState, useEffect } from 'react';
import ChatList from './components/ChatList';
import ChatWindow from './components/ChatWindow';
import { io } from 'socket.io-client';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

function App() {
  const [conversations, setConversations] = useState([]);
  const [activeWaId, setActiveWaId] = useState(null);
  const [activeUserName, setActiveUserName] = useState(null);
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);
  const [isChatWindowOpen, setIsChatWindowOpen] = useState(false);

  const fetchConversations = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/conversations`);
      const data = await response.json();
      setConversations(data);
      if (activeWaId) {
        const currentActiveConv = data.find(conv => conv._id === activeWaId);
        if (currentActiveConv) {
          setActiveUserName(currentActiveConv.userName);
        }
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const fetchMessages = async (waId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/messages/${waId}`);
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    }
  };

  useEffect(() => {
    fetchConversations();

    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    newSocket.on('newMessage', (newMessage) => {
      console.log('Received new message via WebSocket:', newMessage);
      if (newMessage.wa_id === activeWaId) {
        setMessages((prevMessages) => {
          const filteredMessages = newMessage.clientMessageId
            ? prevMessages.filter(msg => msg.clientMessageId !== newMessage.clientMessageId)
            : prevMessages;
          return [...filteredMessages, newMessage];
        });
      }
      fetchConversations();
    });

    newSocket.on('messageStatusUpdate', (updatedMessage) => {
      console.log('Received status update via WebSocket:', updatedMessage);
      if (updatedMessage.wa_id === activeWaId) {
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.message_id === updatedMessage.message_id ? updatedMessage : msg
          )
        );
      }
      fetchConversations();
    });

    newSocket.on('updateConversations', () => {
      console.log('Received updateConversations event via WebSocket');
      fetchConversations();
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });

    return () => newSocket.disconnect();
  }, [activeWaId]);

  useEffect(() => {
    if (activeWaId) {
      fetchMessages(activeWaId);
    }
  }, [activeWaId]);

  const handleSelectChat = (conversation) => {
    setActiveWaId(conversation._id);
    setActiveUserName(conversation.userName);
    setIsChatWindowOpen(true);
  };

  const handleBackToChatList = () => {
    setIsChatWindowOpen(false);
    setActiveWaId(null);
    setActiveUserName(null);
    setMessages([]);
  };

  const handleSendMessage = async (text) => {
    if (!activeWaId) return;

    const clientMessageId = `temp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    const tempMessage = {
      wa_id: activeWaId,
      text,
      timestamp: new Date().toISOString(),
      type: 'text',
      status: 'pending',
      direction: 'outbound',
      clientMessageId: clientMessageId,
      userName: 'You',
    };
    setMessages((prevMessages) => [...prevMessages, tempMessage]);

    try {
      const response = await fetch(`${API_BASE_URL}/send-message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wa_id: activeWaId,
          text,
          clientMessageId,
          contactUserName: activeUserName
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prevMessages) => prevMessages.filter(msg => msg.clientMessageId !== clientMessageId));
      alert('Failed to send message. Please try again.');
    }
  };

  return (
    <div className="flex h-screen antialiased text-gray-800 overflow-hidden">
      <div className="flex flex-col md:flex-row flex-1 w-full h-full">
        <div className={`${isChatWindowOpen ? 'hidden' : 'flex'} md:flex w-full md:w-1/3 lg:w-1/4 flex-col h-full flex-shrink-0`}>
          <ChatList
            conversations={conversations}
            activeWaId={activeWaId}
            onSelectChat={handleSelectChat}
          />
        </div>
        <div className={`${isChatWindowOpen ? 'flex' : 'hidden'} md:flex flex-1 flex-col h-full flex-grow-1 min-w-0`}>
          <ChatWindow
            activeWaId={activeWaId}
            activeUserName={activeUserName}
            messages={messages}
            onSendMessage={handleSendMessage}
            onBack={handleBackToChatList}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
