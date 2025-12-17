import { useAuth } from "@repo/auth-contract";

export function AuthButton() {
    const { user, signIn, signOut, loading } = useAuth();

    if (loading) {
        return <button disabled>Loading...</button>;
    }

    return user ? (
        <button onClick={() => signOut()}>Sign Out</button>
    ) : (
        <button onClick={() => signIn()}>Sign In with Google</button>
    );
}