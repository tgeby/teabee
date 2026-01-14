import { Header } from "@repo/ui";
import { useAuth } from "@repo/auth-contract";
import { Outlet } from "react-router-dom";


export default function Layout() {

    const auth = useAuth();

    return (
        <div className="w-full min-h-screen flex flex-col bg-surface-main">
            <Header/>
            <main className="w-full flex flex-col justify-center items-center">
                <Outlet />
            </main>
        </div>
    );
};