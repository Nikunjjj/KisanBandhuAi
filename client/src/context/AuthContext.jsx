import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { http } from "../api/http";
import { disconnectSocket } from "../api/socket";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("kisanbandhu_token"));
  const [loading, setLoading] = useState(Boolean(token));

  useEffect(() => {
    let isMounted = true;

    async function loadUser() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await http.get("/auth/me");
        if (isMounted) setUser(data.user);
      } catch {
        localStorage.removeItem("kisanbandhu_token");
        if (isMounted) {
          setToken(null);
          setUser(null);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadUser();
    return () => {
      isMounted = false;
    };
  }, [token]);

  function persistSession(nextToken, nextUser) {
    if (token && token !== nextToken) disconnectSocket();
    localStorage.setItem("kisanbandhu_token", nextToken);
    setToken(nextToken);
    setUser(nextUser);
  }

  async function register(payload) {
    const { data } = await http.post("/auth/register", payload);
    persistSession(data.token, data.user);
    return data;
  }

  async function login(payload) {
    const { data } = await http.post("/auth/login", payload);
    persistSession(data.token, data.user);
    return data;
  }

  async function verifyEmail(payload) {
    const { data } = await http.post("/auth/verify-email", payload);
    persistSession(data.token, data.user);
    return data;
  }

  function setSession(nextToken, nextUser) {
    persistSession(nextToken, nextUser);
  }

  function logout() {
    disconnectSocket();
    localStorage.removeItem("kisanbandhu_token");
    setToken(null);
    setUser(null);
  }

  const value = useMemo(
    () => ({ user, token, loading, register, login, verifyEmail, logout, setUser, setSession }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
