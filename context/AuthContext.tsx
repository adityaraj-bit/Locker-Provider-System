"use client";

import { createContext, useContext, useState, useEffect } from "react";

interface AuthContextType {
  role: string | null;
  setRole: (role: string | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  role: null,
  setRole: () => {},
});

export function AuthProvider({ children }: any) {

  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const savedRole = localStorage.getItem("role");
    if (savedRole) setRole(savedRole);
  }, []);

  return (
    <AuthContext.Provider value={{ role, setRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);