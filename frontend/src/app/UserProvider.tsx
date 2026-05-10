"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { Doc } from "convex/_generated/dataModel";

interface UserContextType {
  playerName: string;
  setPlayerName: (name: string) => void;
  user: Doc<"users"> | null | undefined;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [playerName, setPlayerNameState] = useState<string>("");

  useEffect(() => {
    const savedName = localStorage.getItem("playerName");
    if (savedName) {
      setPlayerNameState(savedName);
    }
  }, []);

  // Authoritative sync with backend
  const user = useQuery(api.engine.getUser, playerName ? { name: playerName } : "skip");

  const setPlayerName = (name: string) => {
    setPlayerNameState(name);
    localStorage.setItem("playerName", name);
  };

  return (
    <UserContext.Provider value={{ playerName, setPlayerName, user }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
