import { useAuth } from "@repo/auth-contract";

export function AuthButton() {
    const { user, signIn, signOut, loading } = useAuth();

    if (loading) {
        return <button disabled>Loading...</button>;
    }

    return (user === null) ? (
        <button className="ui:cursor-pointer"onClick={() => signIn()}>Sign In with Google</button>
    ) : (
        <button className="ui:cursor-pointer" onClick={() => signOut()}>Sign Out</button>
    );
}