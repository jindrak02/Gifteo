import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { fetchApi } from '../utils/fetchApi';

interface AuthContextType {
  user: User | null;
  logout: () => void;
}

interface User {
  userId: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState <User | null>(null);

  useEffect(() => {
    async function checkSession() {
      const res = await fetchApi("auth/checkCookie", {
        credentials: "include", // Posílání cookies
      });

      if (res.ok) {
        const data = await res.json();
        setUser({ userId: data.user.id });
      } else {
        console.log("No session found.");
      }
    }

    checkSession();
  }, []);

  async function logout() {
    await fetchApi("auth/logout", {
      method: "POST",
      credentials: "include",
    });

    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};