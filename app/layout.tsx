import type { Metadata } from "next";
import Providers from "@/app/ui/providers/providers";
import chirp from "@/app/ui/fonts/chirp";
import "@/app/styles/globals.css";
import { Suspense } from "react";
import Sidebar from "@/app/ui/Sidebar";
import { auth } from "./lib/auth";
import Twitts from "./ui/TwittsList";
import LoadingSpinner from "./ui/LoadingSpinner";
import TwittsWrapper from "./ui/TwittsWrapper";
import { Button, ButtonGroup } from "@nextui-org/button";
import SidebarWrapper from "./ui/SidebarWrapper";
import Header from "./ui/Header";
import { errorMonitor } from "events";

export const metadata: Metadata = {
  title: {
    template: '%s / X',
    default: 'X'
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
      </head>
      <body className={`${chirp.className}`}>
        <Providers>
          <div className="min-h-screen flex flex-col mx-auto xl:max-w-full lg:max-w-[1100px] max-w-3xl pb-4 bg-background text-forground">
            {/* <header></header> */}
            <main className="flex-1 flex flex-col sm:flex-row">
              {session && <SidebarWrapper />}
              <Suspense fallback={<LoadingSpinner />}>
                {children}
                {session && <div className="max-w-[380px] px-6 flex-1 lg:block hidden" />}
              </Suspense>
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
