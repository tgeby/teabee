import { Header } from "@repo/ui/header";
import { WelcomeUser } from "components/WelcomeUser";

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-surface-main">

      <Header isHomePage={true} />

      <main className="w-full">
        <div className="flex justify-center py-8">
          <WelcomeUser />
        </div>

        <section className="flex min-full justify-center items-center">
          <a 
            href="https://timer.teabee.org" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            Interval Timer App
          </a>
        </section>
      </main>
      <div className="h-screen"></div>

    </div>
  );
}
