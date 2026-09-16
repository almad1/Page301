import React, { createContext, useContext, useState } from 'react';

interface NavContextType {
  currentPage: number;
  navigate: (page: number) => void;
}

const NavContext = createContext<NavContextType>({ currentPage: 300, navigate: () => {} });

export const NavProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPage, setCurrentPage] = useState(300);
  return (
    <NavContext.Provider value={{ currentPage, navigate: setCurrentPage }}>
      {children}
    </NavContext.Provider>
  );
};

export const useNav = () => useContext(NavContext);
