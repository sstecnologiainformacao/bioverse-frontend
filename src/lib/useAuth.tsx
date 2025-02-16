'use client';

import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: iUser | undefined;
  login: (userData: iUser) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface iUser {
  role: string,
  username: null;
}

export function AuthProvider({ children }: { children: ReactNode}) {
  const router = useRouter();
  const [user, setUser] = useState<iUser>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData: iUser) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    if (userData.role === 'admin') {
      router.push('/dashboard');
    } else {
      router.push('/questionnaires');
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}