import "@/app/_styles/globals.css";
import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';
import chirp from "@/app/_ui/fonts/chirp";
import Providers from "@/app/_ui/providers/providers";
import type { Metadata } from "next";
import NextTopLoader from 'nextjs-toploader';

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

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
      </head>
      <body className={`${chirp.className}`}>
        <Providers>
          <NextTopLoader zIndex={100} showSpinner={false} />
          <div className="min-h-[100dvh] flex flex-col mx-auto xl:max-w-full lg:max-w-[1100px] max-w-3xl pb-4 bg-background text-forground">
            <main className="flex-1 flex flex-col justify-center sm:flex-row">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
