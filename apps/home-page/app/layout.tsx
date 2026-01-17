import type { Metadata } from "next";
import "@repo/tailwind-config";
import "@repo/ui/styles.css";
import { FirebaseAuthProvider } from "contexts/auth/FirebaseAuthProvider";

export const metadata: Metadata = {
  title: "TeaBee Home",
  description: "Home of productivity tools",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <FirebaseAuthProvider>
          {children}
        </FirebaseAuthProvider>
      </body>
    </html>
  );
}
