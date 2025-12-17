"use client";

import { useAuth } from "@repo/auth-contract";

export function WelcomeUser() {
    const { user, loading } = useAuth();
    if (loading) {
        return <p>Loading...</p>;
    }
    if (user) {
        return <p>Welcome, {user?.displayName}!</p>;
    }
};