'use client';

import { useEffect, useState } from "react";
import { AuthContext, AuthUser } from "@repo/auth-contract";
import { onAuthStateChanged, signInWithRedirect, signInWithPopup, GoogleAuthProvider, signOut, getRedirectResult } from "firebase/auth";
import { auth } from "lib/firebase";

export function FirebaseAuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        
        getRedirectResult(auth).then((result) => {
            if (result) {
                console.log('Redirect sign-in successful');
            }
        }).catch((error) => {
            console.error('Error during redirect sign-in:', error);
        });

        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {            
            if (currentUser) {
                setUser({
                    uid: currentUser.uid,
                    displayName: currentUser.displayName,
                    email: currentUser.email,
                    photoURL: currentUser.photoURL,
                });
            } else {
                setUser(null);
            }
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
                    try {
                        console.log('Attempting sign-in');
                        if (process.env.NEXT_PUBLIC_DEV === 'true') {
                            await signInWithPopup(auth, provider);
                        } else {
                            await signInWithRedirect(auth, provider);
                        }
                        console.log('Sign-in successful');
                    } catch (error) {
                        console.error('Error during sign-in:', error);
                    }
                },
                signOut: async () => {
                    console.log("Signing out...");
                    await signOut(auth);
                },
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}