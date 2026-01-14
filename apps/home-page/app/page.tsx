import { Header } from "@repo/ui";

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-surface-main">

      <Header isHomePage={true} />

      <main className="w-full h-screen pt-8 text-text-bright text:lg sm:text-2xl flex justify-center">
        <section className="w-fit h-fit p-4 rounded-lg items-center flex flex-col gap-2">
          <p>Check out my first app...</p>
          <p className="text-center">It can help you focus and manage your time!</p>
          <a 
            href="https://timer.teabee.org" 
            target="_blank" 
            rel="noopener noreferrer"
            className="rounded-md transition-colors cursor-pointer p-2 inline-flex items-center gap-2 bg-brand-primary text-text-bright btn-glow select-none text-center text-sm sm:text-lg"
          >
            Interval Timer
          </a>
        </section>
      </main>
      <div className="h-screen"></div>

    </div>
  );
}
