import { Header } from "@repo/ui/header";
import { useAuth } from "@repo/auth-contract";

function App() {

  const auth = useAuth();

  return (
    <>
      <div className="w-full min-h-screen flex flex-col bg-surface-main">
        <Header/>
        <main className="w-full flex justify-center items-center">
          <p>Welcome {auth.user?.displayName || "who are you???"}</p>
        </main>
        
      </div>
    </>
  )
}

export default App
