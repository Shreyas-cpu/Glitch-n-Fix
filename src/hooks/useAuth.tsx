import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = "nexus_auth_token";
const USER_KEY = "nexus_auth_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY);
    const savedUser = localStorage.getItem(USER_KEY);

    if (savedToken && savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setToken(savedToken);
        setUser(parsed);
        axios.defaults.headers.common["Authorization"] = `Bearer ${savedToken}`;

        // Verify token is still valid
        axios
          .get("/api/auth/me")
          .then((res) => {
            setUser(res.data.user);
          })
          .catch(() => {
            // Token expired — clear
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
            delete axios.defaults.headers.common["Authorization"];
            setToken(null);
            setUser(null);
          })
          .finally(() => setIsLoading(false));
      } catch {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  const persist = useCallback((tkn: string, usr: User) => {
    localStorage.setItem(TOKEN_KEY, tkn);
    localStorage.setItem(USER_KEY, JSON.stringify(usr));
    axios.defaults.headers.common["Authorization"] = `Bearer ${tkn}`;
    setToken(tkn);
    setUser(usr);
  }, []);

  const signUp = useCallback(
    async (name: string, email: string, password: string) => {
      const res = await axios.post("/api/auth/signup", { name, email, password });
      persist(res.data.token, res.data.user);
    },
    [persist]
  );

  const signIn = useCallback(
    async (email: string, password: string) => {
      const res = await axios.post("/api/auth/signin", { email, password });
      persist(res.data.token, res.data.user);
    },
    [persist]
  );

  const signOut = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    delete axios.defaults.headers.common["Authorization"];
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
