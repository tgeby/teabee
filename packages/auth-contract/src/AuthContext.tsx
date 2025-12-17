import { createContext, useContext } from "react";

export interface AuthUser {
    uid: string;
    displayName?: string | null;
    email?: string | null;
    photoURL?: string | null;
}

export interface AuthState {
    user: AuthUser | null;
    loading: boolean;
    signIn: () => Promise<void>;
    signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthState | null>(null);

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return ctx;
}