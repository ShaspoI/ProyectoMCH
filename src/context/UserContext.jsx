import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { mockUsers } from "../data/mockUsers.js";

const UserContext = createContext();

const STORAGE_KEY = "maintenance-users";

function loadUsers() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const parsedUsers = stored ? JSON.parse(stored) : mockUsers;

    // ── Migración genérica ────────────────────────────────────────────────
    // Detecta usuarios definidos en mockUsers que no existen en localStorage
    // (identificados por id). Los agrega sin tocar los datos ya persistidos.
    // Esto resuelve el caso en que se añaden usuarios mock en commits posteriores
    // a la primera inicialización del storage.
    const existingIds = new Set(parsedUsers.map((u) => u.id));
    const missingUsers = mockUsers.filter((u) => !existingIds.has(u.id));
    const merged = missingUsers.length > 0
      ? [...parsedUsers, ...missingUsers]
      : parsedUsers;

    // Persiste el resultado solo si hubo cambios (evita escritura innecesaria)
    if (missingUsers.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    }

    // ── Recuperación de emergencia: garantizar al menos un admin activo ───
    const hasActiveAdmin = merged.some((u) => u.role === "admin" && u.estado === "Activo");
    if (!hasActiveAdmin && merged.length > 0) {
      const preferredIndex = merged.findIndex((u) => u.email === "admin@industria.com");
      const adminIndex = preferredIndex !== -1 ? preferredIndex : 0;
      merged[adminIndex] = {
        ...merged[adminIndex],
        rol: "Admin",
        role: "admin",
        estado: "Activo",
      };
    }

    return merged;
  } catch {
    return mockUsers;
  }
}

/** Genera un ID en formato U-XXX, compatible con futura migración a UUIDs de backend. */
function generateUserId(users) {
  const maxNum = users.reduce((max, u) => {
    const match = String(u.id).match(/^U-(\d+)$/);
    return match ? Math.max(max, parseInt(match[1], 10)) : max;
  }, 100);
  return `U-${maxNum + 1}`;
}

export function UserProvider({ children }) {
  const [users, setUsers] = useState(loadUsers);

  // Persiste todos los cambios en localStorage automáticamente
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
  }, [users]);

  /**
   * REGLA CRÍTICA: Las validaciones de negocio SIEMPRE deben ejecutarse
   * ANTES de llamar a setUsers, usando el estado `users` del closure.
   * Lanzar un Error dentro del callback de setUsers hace que React lo trate
   * como un error irrecuperable del árbol de componentes, colapsando la UI.
   * Al validar antes del setState, el throw es síncrono y capturable con try/catch.
   */

  /** Crea un nuevo usuario. Valida unicidad de legajo, email y teléfono. */
  const addUser = useCallback(
    (userData) => {
      // ─── Validaciones ANTES del setState ────────────────────────────────
      if (users.find((u) => u.legajo === userData.legajo)) {
        throw new Error("El legajo ya está en uso por otro usuario.");
      }
      if (users.find((u) => u.email === userData.email)) {
        throw new Error("El email ya está en uso por otro usuario.");
      }
      if (userData.telefono && users.find((u) => u.telefono === userData.telefono)) {
        throw new Error("El teléfono ya está en uso por otro usuario.");
      }
      // ─── Solo si pasan todas las validaciones, actualizamos el estado ───
      const userRol = userData.rol || "Usuario";
      const newUser = {
        ...userData,
        id: generateUserId(users),
        fechaRegistro: new Date().toISOString().split("T")[0],
        estado: userData.estado || "Activo",
        rol: userRol,
        role: userRol === "Admin" ? "admin" : userRol === "Técnico" ? "tecnico" : "usuario",
      };
      setUsers((prev) => [...prev, newUser]);
    },
    [users],
  );

  /** Edición completa de un usuario por parte del administrador. */
  const updateUser = useCallback(
    (id, userData) => {
      // ─── Validación ANTES del setState ──────────────────────────────────
      if (users.find((u) => u.legajo === userData.legajo && u.id !== id)) {
        throw new Error("El legajo ya está en uso por otro usuario.");
      }
      // ─── Verificación de Regla de Negocio: Administrador Único ──────────
      const userToUpdate = users.find(u => u.id === id);
      if (userToUpdate && userToUpdate.role === "admin" && userToUpdate.estado === "Activo") {
        const newRol = userData.rol ?? userToUpdate.rol;
        const newRole = newRol === "Admin" ? "admin" : newRol === "Técnico" ? "tecnico" : "usuario";
        const newEstado = userData.estado ?? userToUpdate.estado;
        
        if (newRole !== "admin" || newEstado !== "Activo") {
          const otherActiveAdmins = users.filter((u) => u.id !== id && u.role === "admin" && u.estado === "Activo");
          if (otherActiveAdmins.length === 0) {
            throw new Error("No se puede realizar esta acción: el sistema debe tener al menos un administrador activo.");
          }
        }
      }

      // ─── Solo si pasa la validación, actualizamos el estado ─────────────
      setUsers((prev) => prev.map((u) => {
        if (u.id !== id) return u;
        const newRol = userData.rol ?? u.rol;
        const newRole = newRol === "Admin" ? "admin" : newRol === "Técnico" ? "tecnico" : "usuario";
        return { ...u, ...userData, rol: newRol, role: newRole };
      }));
    },
    [users],
  );

  /**
   * Actualización del perfil propio del usuario (email, teléfono, contraseña).
   * Diferenciada de updateUser para que en el futuro tenga sus propias reglas
   * de autorización: un usuario solo puede editar su propio perfil.
   */
  const updateUserProfile = useCallback(
    (id, { email, telefono, password }) => {
      // ─── Validación ANTES del setState ──────────────────────────────────
      if (users.find((u) => u.email === email && u.id !== id)) {
        throw new Error("El email ya está en uso por otro usuario.");
      }
      // ─── Solo si pasa la validación, actualizamos el estado ─────────────
      setUsers((prev) =>
        prev.map((u) => {
          if (u.id !== id) return u;
          return {
            ...u,
            email,
            telefono,
            // Solo actualiza la contraseña si se proporcionó una nueva
            ...(password ? { password, tempPassword: false } : {}),
          };
        }),
      );
    },
    [users],
  );

  const toggleUserStatus = useCallback((id) => {
    const userToUpdate = users.find((u) => u.id === id);
    if (userToUpdate && userToUpdate.role === "admin" && userToUpdate.estado === "Activo") {
      const otherActiveAdmins = users.filter((u) => u.id !== id && u.role === "admin" && u.estado === "Activo");
      if (otherActiveAdmins.length === 0) {
        throw new Error("No se puede desactivar al único administrador activo del sistema.");
      }
    }

    setUsers((prev) =>
      prev.map((u) =>
        u.id === id
          ? { ...u, estado: u.estado === "Activo" ? "Inactivo" : "Activo" }
          : u,
      ),
    );
  }, [users]);

  /**
   * Genera una contraseña temporal simulada.
   * En producción: el backend genera, hashea y almacena la clave temporal.
   * El frontend solo recibe la clave en texto plano para mostrarla una única vez.
   */
  const resetUserPassword = useCallback((id) => {
    const tempPassword = Math.random().toString(36).slice(-8);
    // Actualizamos el estado para que el login con la nueva clave funcione en la demo
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, password: tempPassword, tempPassword: true } : u)),
    );
    return tempPassword;
  }, []);

  return (
    <UserContext.Provider
      value={{
        users,
        addUser,
        updateUser,
        updateUserProfile,
        toggleUserStatus,
        resetUserPassword,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUsers() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUsers debe ser usado dentro de un UserProvider");
  return ctx;
}
