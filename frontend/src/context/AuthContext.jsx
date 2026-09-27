import { createContext, useContext, useEffect, useState } from "react";
import {
  login as apiLogin,
  signup as apiSignup,
  fetchMe,
  getToken,
  getUser,
  setToken,
  setUser,
} from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(getUser());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function check() {
      const token = getToken();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const me = await fetchMe();
        setUserState(me);
        setUser(me);
      } catch {
        setToken(null);
        setUser(null);
        setUserState(null);
      } finally {
        setLoading(false);
      }
    }
    check();
  }, []);

  async function signup(name, email, password) {
    const data = await apiSignup(name, email, password);
    setToken(data.access_token);
    setUser(data.user);
    setUserState(data.user);
    return data.user;
  }

  async function login(email, password) {
    const data = await apiLogin(email, password);
    setToken(data.access_token);
    setUser(data.user);
    setUserState(data.user);
    return data.user;
  }

  function logout() {
    setToken(null);
    setUser(null);
    setUserState(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}