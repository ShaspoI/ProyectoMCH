import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { mockTickets } from "../data/mockTickets.js";

const TicketContext = createContext(null);

const STORAGE_KEY = "maintenance-tickets";

function loadTickets() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : mockTickets;
  } catch {
    return mockTickets;
  }
}

export function TicketProvider({ children }) {
  const [tickets, setTickets] = useState(loadTickets);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
  }, [tickets]);

  const addTicket = useCallback((ticket) => {
    setTickets((prev) => [...prev, ticket]);
  }, []);

  const updateTicket = useCallback((ticketId, updates) => {
    setTickets((prev) => prev.map((t) => (t.id === ticketId ? { ...t, ...updates } : t)));
  }, []);

  return (
    <TicketContext.Provider value={{ tickets, setTickets, addTicket, updateTicket }}>
      {children}
    </TicketContext.Provider>
  );
}

export function useTickets() {
  const ctx = useContext(TicketContext);
  if (!ctx) throw new Error("useTickets must be used within TicketProvider");
  return ctx;
}
