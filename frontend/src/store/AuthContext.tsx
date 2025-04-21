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
        //console.log('Session found:', data.user);
        
      } else {
        console.log("No session found.");
      }
    }

    checkSession();
  }, []);

  async function logout() {
    try {
      const res = await fetchApi("auth/logout", {
        method: "POST",
        credentials: "include",
      });
  
      const data = await res.json();

      if (data.success) {
        setUser(null);
        console.log("Logout Successful.");
        window.location.href = "/";
      } else {
        throw new Error(data.message || "Logout failed");
      }
      
    } catch (error) {
      console.error("Error during logout:", error);
      throw error;
    }
    
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