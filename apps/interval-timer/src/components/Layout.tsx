import { Header } from "@repo/ui";
import { Outlet } from "react-router-dom";


export default function Layout() {

    return (
        <div className="w-full min-h-screen flex flex-col bg-surface-main">
            <Header title={"Interval Timer"}/>
            <main className="w-full flex flex-col justify-center items-center">
                <Outlet />
            </main>
        </div>
    );
};