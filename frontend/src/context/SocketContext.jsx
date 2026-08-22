import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

const getSocketURL = () => {
  let url = import.meta.env.VITE_API_URL;
  if (url) {
    return url.trim().replace(/\/+$/, '').replace(/\/api$/, '');
  }
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return 'https://sevasetu-m2fg.onrender.com';
  }
  return window.location.origin.replace(':3000', ':5000');
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const newSocket = io(getSocketURL(), {
      transports: ['websocket', 'polling'],
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    if (socket && user) {
      socket.emit('join_room', user._id);
    }
  }, [socket, user]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
