import { useEffect, useState } from "react";
import { AuthContext } from "@repo/auth-contract";
import { onAuthStateChanged, signInWithRedirect, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { auth } from "../firebase";

export function FirebaseAuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {            
            setUser(currentUser);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                signIn: async () => {
                    const provider = new GoogleAuthProvider();
                    if (import.meta.env.VITE_DEV === 'true') {
                        await signInWithPopup(auth, provider);
                    } else {
                        await signInWithRedirect(auth, provider);
                    }
                },
                signOut: async () => {
                    await signOut(auth);
                },
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}