import React, { createContext, useEffect, useState } from "react";
import { api } from "../api/client";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "guest" | "host" | "admin";
};

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  register: (input: {
    name: string;
    email: string;
    password: string;
  }) => Promise<void>;
  login: (input: { email: string; password: string }) => Promise<void>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
);

const AUTH_TOKEN_KEY = "airbnb_clone_auth_token";

type AuthProviderProps = {
  children: React.ReactNode;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Load token & user on first mount
  useEffect(() => {
    const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
    if (!storedToken) {
      setLoading(false);
      return;
    }

    setToken(storedToken);
    api
      .me(storedToken)
      .then((res) => {
        setUser(res.user as AuthUser);
      })
      .catch(() => {
        setUser(null);
        setToken(null);
        localStorage.removeItem(AUTH_TOKEN_KEY);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleAuthSuccess = (payload: { user: any; token: string }) => {
    const authUser: AuthUser = {
      id: payload.user.id,
      name: payload.user.name,
      email: payload.user.email,
      role: payload.user.role,
    };
    setUser(authUser);
    setToken(payload.token);
    localStorage.setItem(AUTH_TOKEN_KEY, payload.token);
  };

  const register = async (input: {
    name: string;
    email: string;
    password: string;
  }) => {
    const res = await api.register(input);
    handleAuthSuccess(res);
  };

  const login = async (input: { email: string; password: string }) => {
    const res = await api.login(input);
    handleAuthSuccess(res);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(AUTH_TOKEN_KEY);
  };

  const value: AuthContextValue = {
    user,
    token,
    loading,
    register,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
