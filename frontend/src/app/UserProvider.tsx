"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { Doc } from "convex/_generated/dataModel";

interface UserContextType {
  playerName: string;
  setPlayerName: (name: string) => void;
  playerId: string | undefined;
  setPlayerId: (id: string | undefined) => void;
  user: Doc<"profiles"> | null | undefined;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [playerName, setPlayerNameState] = useState<string>("");
  const [playerId, setPlayerIdState] = useState<string | undefined>(undefined);

  useEffect(() => {
    const savedName = localStorage.getItem("playerName");
    const savedId = localStorage.getItem("playerId");
    if (savedName) setPlayerNameState(savedName);
    if (savedId) setPlayerIdState(savedId);
  }, []);

  // Authoritative sync with backend
  const user = useQuery(api.engine.getUser, playerName ? { name: playerName } : "skip");

  const setPlayerName = (name: string) => {
    setPlayerNameState(name);
    localStorage.setItem("playerName", name);
  };

  const setPlayerId = (id: string | undefined) => {
    setPlayerIdState(id);
    if (id) {
      localStorage.setItem("playerId", id);
    } else {
      localStorage.removeItem("playerId");
    }
  };

  return (
    <UserContext.Provider value={{ playerName, setPlayerName, playerId, setPlayerId, user }}>
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
