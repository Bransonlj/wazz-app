import { socket } from "@/socket";
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";

interface SocketContextInterface {
  isConnected: boolean;
  connect: (userId: string) => void;
  disconnect: () => void;
}

const SocketContext = createContext<SocketContextInterface>({
  isConnected: false,
  connect: () => {},
  disconnect: () => {}
});

export function useSocket() {
  return useContext(SocketContext);
}

export function SocketProvider({ children }: { children: ReactNode}) {

  const [isConnected, setIsConnected] = useState<boolean>(false);

  function connect(userId: string) {
    socket.auth = { userId };
    socket.connect();
  }

  function disconnect() {
    socket.disconnect();
  }

  useEffect(() => {
    function handleConnect() {
      console.log("connected");
      setIsConnected(true);
    }
    function handleDisonnect() {
      console.log("disconnected");
      setIsConnected(false);
    }

    function handleError(err: any) {
      console.log(`connection error: ${err.message}`);
    }

    socket.on("connect_error", handleError)
    socket.on("connect", handleConnect)
    socket.on("disconnect", handleDisonnect)

    return () => {
      socket.off("connect", handleConnect)
      socket.off("connect_error", handleError)
      socket.off("disconnect", handleDisonnect)
    }
  }, []);

  const value = useMemo(() => ({
    isConnected,
    connect,
    disconnect,
  }), [isConnected, connect, disconnect]);

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}