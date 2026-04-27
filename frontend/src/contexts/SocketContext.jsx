import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      const newSocket = io('http://localhost:5000');
      setSocket(newSocket);

      newSocket.on('connect', () => {
        console.log('Connected to server');
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from server');
      });

      return () => {
        newSocket.close();
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [isAuthenticated]);

  const joinRoom = (roomId) => {
    if (socket) {
      socket.emit('join_room', roomId);
    }
  };

  const leaveRoom = (roomId) => {
    if (socket) {
      socket.emit('leave_room', roomId);
    }
  };

  const joinConversation = (conversationId) => {
    if (socket) {
      socket.emit('join_conversation', conversationId);
    }
  };

  const leaveConversation = (conversationId) => {
    if (socket) {
      socket.emit('leave_conversation', conversationId);
    }
  };

  const sendMessage = (conversationId, content, senderId) => {
    if (socket) {
      socket.emit('send_message', {
        conversationId,
        content,
        senderId,
      });
    }
  };

  const onReceiveMessage = (callback) => {
    if (socket) {
      socket.on('receive_message', callback);
    }
  };

  const offReceiveMessage = (callback) => {
    if (socket) {
      socket.off('receive_message', callback);
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        onlineUsers,
        joinRoom,
        leaveRoom,
        joinConversation,
        leaveConversation,
        sendMessage,
        onReceiveMessage,
        offReceiveMessage,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
