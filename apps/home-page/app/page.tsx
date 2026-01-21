import { Header } from "@repo/ui";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-surface-main overflow-x-hidden">

      <Header isHomePage={true} />

      <main className="w-full text-text-bright text:lg sm:text-2xl flex flex-col justify-center">
        <div id="about" className="w-full min-h-[512px] h-[90dvh] bg-gray-400 flex flex-col sm:flex-row items-center px-10">
          <div className="relative size-64 sm:size-80 lg:size-96 shrink-0">
            <Image src="/TeaBee.svg" alt="Bee Holding Mug of Tea" fill loading="eager" />
          </div>
          <div className="text-black font-medium text-lg sm:text-2xl flex flex-col gap-8">
              <h1 className="text-3xl sm:text-8xl font-bold">About TeaBee</h1>
              <p className="leading-relaxed">
                Life is busy. TeaBee is here to help you navigate it.
              </p>
              <p>
                I build simple, effective tools designed to give you back control over your time, health, and daily well-being.
              </p>
          </div>
        </div>
        <section id="apps" className="w-full h-[50dvh] sm:h-dvh p-4 rounded-lg items-center justify-center flex flex-col gap-2 text-3xl">
          <p className="text-center">Check out my first app...</p>
          <p className="text-center">It can help you focus and manage your time!</p>
          <a 
            href="https://timer.teabee.org" 
            target="_blank" 
            rel="noopener noreferrer"
            className="rounded-md transition-colors cursor-pointer p-2 inline-flex items-center gap-2 bg-brand-primary text-text-bright btn-glow select-none text-center text-xl sm:text-4xl"
          >
            Interval Timer
          </a>
        </section>
      </main>

    </div>
  );
}
