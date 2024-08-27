import { createContext, useState, FC, ReactNode, useContext } from 'react';

interface ConnContextType {
  conn: WebSocket | undefined;
  setConn: (connValue: WebSocket) => void;
}

export const ConnContext = createContext<ConnContextType | null>(null);

export const useConn = () => {
  const context = useContext(ConnContext);
  if (!context) {
    throw new Error("useConn must be used within a ConnProvider");
  }
  return context;
};

const ConnProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [conn, setConn] = useState<WebSocket | undefined>(undefined);

  const settingConnValue = (connValue: WebSocket) => {
    setConn(connValue);
  };

  return (
    <ConnContext.Provider value={{ conn, setConn: settingConnValue }}>
      {children}
    </ConnContext.Provider>
  );
};

export default ConnProvider;
