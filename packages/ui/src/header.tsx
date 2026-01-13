"use client";

import { AuthButton } from "./AuthButton";
import { LuHouse } from "react-icons/lu";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { SplitText } from "gsap/all";

gsap.registerPlugin(SplitText);

export function Header({ isHomePage } : { isHomePage?: boolean }) {

  useGSAP(() => {

    const titleChars = SplitText.create("#title", { type: "chars" });

    gsap.from(titleChars.chars, {
      opacity: 0,
      y: 5,
      stagger: 0.09,
      duration: 0.1,
      ease: "power2.out",
    });

  });

  return (
    <header className="grid grid-cols-3 items-center px-4 bg-brand-primary 
                      w-dvw min-h-16 shadow-black/50 shadow-lg mb-4 sticky 
                      top-0 z-50 text-text-bright">
      <div className="flex justify-center items-center">
        {isHomePage ? (
          <div className="flex justify-center items-center size-11">
            <LuHouse className="size-7" />
          </div>
        ) : (
          <a 
            href="https://teabee.org"
            className="flex justify-center items-center size-11 hover:opacity-50 bg-white/10 rounded-full transition-opacity"
          >
            <LuHouse className="size-7" />
          </a>
        )}
      </div>
      
      <h1 id="title" className="text-2xl sm:text-3xl text-center font-bold mb-1">TeaBee</h1>
      <AuthButton />

    </header>
  );
}