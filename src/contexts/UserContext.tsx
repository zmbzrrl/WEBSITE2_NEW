import React, { createContext, useContext, useState } from 'react';

export interface AppUser {
  email: string | null;
  ugId?: string | null;
}

interface UserContextValue {
  user: AppUser;
  setUser: (u: AppUser) => void;
}

const UserContext = createContext<UserContextValue>({ user: { email: null }, setUser: () => {} });

export const UserProvider: React.FC<{ children: React.ReactNode }>= ({ children }) => {
  const [user, setUser] = useState<AppUser>({ email: null });
  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);


