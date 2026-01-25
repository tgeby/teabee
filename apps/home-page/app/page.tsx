import { Header } from "@repo/ui";
import AppDisplay from "components/AppDisplay";
import SiteSummary from "components/SiteSummary";

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-surface-main overflow-x-hidden">

      <Header isHomePage={true} />

      <main className="w-full text-text-bright text:lg sm:text-2xl flex flex-col justify-center">
        <SiteSummary />
        <AppDisplay />
      </main>
    </div>
  );
}
