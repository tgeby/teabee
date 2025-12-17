import React from "react";
import { AuthButton } from "./AuthButton";

export function Header() {
  return (
    <header className="ui:flex ui:justify-around ui:items-center ui:bg-dark-green-1000 ui:min-w-screen ui:min-h-16">
      
      <div>
        <AuthButton
        />
      </div>
    </header>
  );
}