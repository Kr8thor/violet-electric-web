import React, { createContext, useContext, useEffect, useState } from 'react';

interface EditModeContextType {
  isEditing: boolean;
  setEditing: (val: boolean) => void;
}

const EditModeContext = createContext<EditModeContextType>({
  isEditing: false,
  setEditing: () => {},
});

export const EditModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isEditing, setEditing] = useState(false);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === 'violet-enable-editing') {
        setEditing(true);
      }
      if (event.data?.type === 'violet-disable-editing') {
        setEditing(false);
      }
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <EditModeContext.Provider value={{ isEditing, setEditing }}>
      {children}
    </EditModeContext.Provider>
  );
};

export const useEditModeContext = () => useContext(EditModeContext); 