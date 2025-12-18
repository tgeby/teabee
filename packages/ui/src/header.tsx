"use client";

import { AuthButton } from "./AuthButton";
import { LuHouse } from "react-icons/lu";

export function Header({ isHomePage } : { isHomePage?: boolean }) {
  return (
    <header className="ui:grid ui:grid-cols-3 ui:items-center ui:px-4 ui:bg-brand-primary 
                      ui:w-full ui:min-h-16 ui:shadow-black/50 ui:shadow-lg ui:mb-4 ui:sticky 
                      ui:top-0 ui:z-50 ui:text-text-bright">
      <div className="ui:flex ui:justify-center ui:items-center">
        {isHomePage ? (
          <div className="ui:flex ui:justify-center ui:items-center ui:size-11">
            <LuHouse className="ui:size-7" />
          </div>
        ) : (
          <a 
            href="https://teabee.org"
            className="ui:flex ui:justify-center ui:items-center ui:size-11 ui:hover:opacity-50 ui:bg-white/10 ui:rounded-full ui:transition-opacity"
          >
            <LuHouse className="ui:size-7" />
          </a>
        )}
      </div>
      
      <h1 className="ui:text-3xl ui:text-center ui:font-bold ui:mb-1">TeaBee</h1>
      <AuthButton />

    </header>
  );
}