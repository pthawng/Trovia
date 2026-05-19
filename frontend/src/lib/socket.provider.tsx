import React, { createContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "./auth-context";

interface SocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
}

export const SocketContext = createContext<SocketContextValue | null>(null);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // If user logs out, clean up socket connection immediately
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      setIsConnected(false);
      return;
    }

    const token = localStorage.getItem("accessToken");
    if (!token) return;

    const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:3001";

    // Connect to backend NestJS server using JWT authentication (Root namespace /)
    const newSocket = io(socketUrl, {
      auth: { token },
      query: { token },
      transports: ["websocket"],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      withCredentials: true,
    });

    newSocket.on("connect", () => {
      setIsConnected(true);
      console.log("Socket.IO client successfully connected to Trovia PropTech");
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
      console.log("Socket.IO client disconnected from Trovia PropTech");
    });

    newSocket.on("connect_error", (err) => {
      console.error("Socket.IO Connection Handshake Error:", err.message);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
      setSocket(null);
      setIsConnected(false);
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}
