import { Header } from "@repo/ui/header";
import { useAuth } from "@repo/auth-contract";

function App() {

  const auth = useAuth();

  return (
    <>
      <div className="min-h-screen flex flex-col bg-main-blue-1000">
        <Header />
        <p>Welcome {auth.user?.displayName || "who are you???"}</p>
      </div>
    </>
  )
}

export default App
