import { useState } from "react";
import { useAuth } from "@repo/auth-contract";
import { LuLogOut } from "react-icons/lu";
import { FcGoogle } from "react-icons/fc";

export function AuthButton() {
    const { user, signIn, signOut, loading } = useAuth();
    const [showProfileImage, setShowProfileImage] = useState(true);

    console.log("photo url: ", user?.photoURL);

    if (loading) {
        return (
            <div className="ui:flex ui:items-center ui:justify-center">
                <div className="ui:animate-spin ui:rounded-full ui:h-8 ui:w-8 ui:border-b-2 ui:border-white"></div>
            </div>
        );
    }

    return (user === null) ? (
        <div className="ui:flex ui:items-center ui:justify-center">
            <button className="ui:flex ui:items-center ui:justify-center ui:cursor-pointer ui:transition-colors ui:hover:opacity-50 ui:size-11 ui:bg-white/10 ui:rounded-full" onClick={() => signIn()}>
                <FcGoogle className="ui:size-7" />
            </button>
        </div>
    ) : (
        <div className="ui:flex ui:justify-center ui:items-center ui:gap-2 ui:sm:gap-3">
            {showProfileImage && user.photoURL && (
                <img
                    src={user.photoURL}
                    alt="Profile"
                    className="ui:size-8 ui:rounded-full"
                    onError={() => {
                        console.log("Profile image not found");
                        setShowProfileImage(false);
                    }}
                />
            )}
            <button 
                className="ui:flex ui:size-11 ui:cursor-pointer ui:items-center ui:justify-center ui:leading-none ui:rounded-full ui:hover:opacity-50 ui:bg-white/10 ui:transition-opacity" 
                onClick={() => signOut()}
            >
                <LuLogOut className="ui:size-7" />
                <span className="ui:sr-only">Sign Out</span>
            </button>
        </div>
    );
}