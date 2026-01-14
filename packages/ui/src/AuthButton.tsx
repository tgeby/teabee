"use client";

import { useState } from "react";
import { useAuth } from "@repo/auth-contract";
import { LuLogOut } from "react-icons/lu";
import { FcGoogle } from "react-icons/fc";

export function AuthButton() {
    const { user, signIn, signOut, loading } = useAuth();
    const [showProfileImage, setShowProfileImage] = useState(true);

    if (loading) {
        return (
            <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
        );
    }

    return (user === null) ? (
        <div className="flex items-center justify-center">
            <button className="flex items-center justify-center cursor-pointer transition-colors hover:opacity-50 size-11 bg-white/10 rounded-full" onClick={() => signIn()}>
                <FcGoogle className="size-7" />
            </button>
        </div>
    ) : (
        <div className="flex justify-center items-center gap-2 sm:gap-3">
            {showProfileImage && user.photoURL && (
                <img
                    src={user.photoURL}
                    alt="Profile"
                    className="size-8 rounded-full"
                    onError={() => {
                        console.log("Profile image not found");
                        setShowProfileImage(false);
                    }}
                />
            )}
            <button 
                className="flex size-11 cursor-pointer items-center justify-center leading-none rounded-full hover:opacity-50 bg-white/10 transition-opacity" 
                onClick={() => signOut()}
            >
                <LuLogOut className="size-7" />
                <span className="sr-only">Sign Out</span>
            </button>
        </div>
    );
}