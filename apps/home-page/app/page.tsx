import { Header } from "@repo/ui";

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-surface-main">

      <Header isHomePage={true} />

      <main className="w-full h-screen pt-8 text-text-bright text-2xl flex justify-center">
        <section className="w-fit h-fit p-8 rounded-lg items-center bg-brand-primary flex gap-8">
          <span>Check out my first app...</span>
          <a 
            href="https://timer.teabee.org" 
            target="_blank" 
            rel="noopener noreferrer"
            className="rounded-md transition-colors cursor-pointer px-3 flex items-center gap-2 bg-surface-alt text-text-bright btn-glow h-8 self-center"
          >
            Interval Timer App
          </a>
        </section>
      </main>
      <div className="h-screen"></div>

    </div>
  );
}
