/**
 * AuthContext — Contexte d'authentification
 * Fournit l'accès au state auth via `useAuth()`.
 */
import { createContext, useContext } from 'react';

export const AuthContext = createContext(null);

/**
 * Hook `useAuth` — consomme le contexte d'authentification
 * Doit être utilisé à l'intérieur d'un `AuthProvider`.
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
  }

  return context;
}
