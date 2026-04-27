import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { ArrowLeft, Send, User } from 'lucide-react';
import axios from 'axios';

const Chat = () => {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket, joinRoom, leaveRoom, sendMessage, onReceiveMessage, offReceiveMessage } = useSocket();
  
  const [chat, setChat] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchChat();
  }, [itemId]);

  useEffect(() => {
    if (chat && socket) {
      joinRoom(chat._id);
      
      const handleReceiveMessage = (newMessage) => {
        setChat(prev => ({
          ...prev,
          messages: [...prev.messages, newMessage]
        }));
        scrollToBottom();
      };

      onReceiveMessage(handleReceiveMessage);

      return () => {
        offReceiveMessage(handleReceiveMessage);
        leaveRoom(chat._id);
      };
    }
  }, [chat, socket, joinRoom, leaveRoom, onReceiveMessage, offReceiveMessage]);

  useEffect(() => {
    scrollToBottom();
  }, [chat?.messages]);

  const fetchChat = async () => {
    try {
      const response = await axios.get(`/api/chat/item/${itemId}`);
      setChat(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching chat:', error);
      setError('Failed to load chat');
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() || !chat) return;

    const otherParticipant = chat.participants.find(p => p._id !== user.id);
    
    sendMessage(
      chat._id,
      message.trim(),
      user.id,
      otherParticipant._id
    );

    const newMessage = {
      senderId: { _id: user.id, name: user.name },
      message: message.trim(),
      timestamp: new Date()
    };

    setChat(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage],
      lastMessage: message.trim(),
      lastMessageTime: new Date()
    }));

    setMessage('');
    scrollToBottom();
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const groupMessagesByDate = (messages) => {
    const groups = {};
    messages.forEach(msg => {
      const date = new Date(msg.timestamp).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(msg);
    });
    return groups;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={() => navigate(-1)}
          className="btn-primary"
        >
          Go Back
        </button>
      </div>
    );
  }

  const otherParticipant = chat.participants.find(p => p._id !== user.id);
  const messageGroups = groupMessagesByDate(chat.messages);

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)]">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col">
        <div className="border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{otherParticipant?.name}</h3>
                  <p className="text-sm text-gray-600">About: {chat.item?.title}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {chat.messages.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Start the conversation</h3>
              <p className="text-gray-600">Send a message to {otherParticipant?.name}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(messageGroups).map(([date, messages]) => (
                <div key={date}>
                  <div className="text-center mb-4">
                    <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      {formatDate(messages[0].timestamp)}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {messages.map((msg, index) => {
                      const isSent = msg.senderId._id === user.id;
                      return (
                        <div
                          key={index}
                          className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-xs lg:max-w-md ${isSent ? 'order-2' : 'order-1'}`}>
                            <div
                              className={`message-bubble ${isSent ? 'sent' : 'received'}`}
                            >
                              <p className="text-sm">{msg.message}</p>
                            </div>
                            <p className={`text-xs text-gray-500 mt-1 ${isSent ? 'text-right' : 'text-left'}`}>
                              {formatTime(msg.timestamp)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 p-4">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
            <button
              type="submit"
              disabled={!message.trim()}
              className="btn-primary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;
