import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

interface AuthContextType {
  user: Object | null;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState <any>(null);

  useEffect(() => {
    async function checkSession() {
      const res = await fetch("http://localhost:3000/api/auth/checkCookie", {
        credentials: "include", // Posílání cookies
      });

      if (res.ok) {
        const data = await res.json();
        setUser({ userId: data.userId });
      } else {
        console.log("No session found.");
      }
    }

    checkSession();
  }, []);

  async function logout() {
    await fetch("http://localhost:3000/api/auth/logout", {
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