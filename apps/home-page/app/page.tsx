import { Header } from "@repo/ui/header";
import { WelcomeUser } from "components/WelcomeUser";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <main>
        <Header />
        <div className="flex justify-center">
        <WelcomeUser />
        </div>
        <section className="flex min-h-screen justify-center items-center">
          <a href="https://timer.teabee.org" target="_blank" rel="noopener noreferrer">Interval Timer App</a>
        </section>
      </main>
    </div>
  );
}
