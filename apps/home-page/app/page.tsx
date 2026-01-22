import { Header } from "@repo/ui";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-surface-main overflow-x-hidden">

      <Header isHomePage={true} />

      <main className="w-full text-text-bright text:lg sm:text-2xl flex flex-col justify-center">
        <div id="about" className="w-full flex items-center justify-center px-4 sm:px-32 lg:px-64 py-8">
          <div className="relative size-32 sm:size-48 md-64 shrink-0">
            <Image src="/TeaBee.svg" alt="Bee Holding Mug of Tea" fill loading="eager" />
          </div>
          <div className="font-medium text-lg sm:text-xl lg:text-3xl flex flex-col text-center gap-8 max-w-[200px] sm:max-w-[300px] md:max-w-[500px]">
              <p className="leasding-relaxed font-bold">
                Life is busy. TeaBee is here to help you navigate it.
              </p>
          </div>
        </div>
        <section id="apps" className="w-full flex-1 pt-8 sm:pt-16 pb-32 items-center justify-start flex flex-col gap-2 text-3xl rounded-t-2xl">
          <h1 className="font-bold">My Apps</h1>
          <ul className="flex flex-col gap-8 mt-8">
            <li className="max-w-[500px] flex flex-col gap-8 items-center text-lg sm:text-xl text-center px-8">
              <a 
                href="https://timer.teabee.org" 
                target="_blank" 
                rel="noopener noreferrer"
                className="rounded-md transition-colors cursor-pointer p-2 w-fit items-center gap-2 bg-brand-primary text-text-bright btn-glow select-none text-center text-xl sm:text-4xl"
              >
                Interval Timer
              </a>
              <p>Create custom interval lists (like Pomodoro) that sync to your Google account.</p>
              <p className="italic">Note: Mobile apps are coming soon. The current web version requires your screen to stay active.</p>
            </li>
          </ul>
        </section>
      </main>
    </div>
  );
}
