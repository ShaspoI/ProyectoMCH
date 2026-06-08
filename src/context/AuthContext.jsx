import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { mockUsers } from "../data/mockUsers.js";

const AuthContext = createContext(null);

const USERS_KEY = "maintenance-users";
const SESSION_KEY = "maintenance-session";

function loadUsers() {
  try {
    const stored = localStorage.getItem(USERS_KEY);
    return stored ? JSON.parse(stored) : mockUsers;
  } catch {
    return mockUsers;
  }
}

export function AuthProvider({ children }) {
  const [users, setUsers] = useState(loadUsers);
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  }, [user]);

  const login = useCallback(
    (identifier, password) => {
      const found = users.find(
        (u) => (u.legajo === identifier || u.email === identifier) && u.password === password,
      );
      if (!found) return { success: false, error: "Credenciales invalidas" };
      const { password: _, ...safeUser } = found;
      setUser(safeUser);
      return { success: true, user: safeUser };
    },
    [users],
  );

  const register = useCallback(
    (userData) => {
      const exists = users.find((u) => u.legajo === userData.legajo || u.email === userData.email);
      if (exists) return { success: false, error: "El legajo o email ya esta registrado" };
      const newUser = { id: `usr-${Date.now()}`, role: "usuario", ...userData };
      setUsers((prev) => [...prev, newUser]);
      return { success: true };
    },
    [users],
  );

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
