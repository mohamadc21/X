import React, { Suspense } from 'react';
import SidebarWrapper from "@/app/_ui/SidebarWrapper";
import LoadingSpinner from '../_ui/LoadingSpinner';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <>
      <SidebarWrapper />
      <div className="flex-1 w-full max-w-2xl sm:border-x border-x-default">
        <Suspense fallback={<LoadingSpinner wrapperClassName="min-h-[80dvh]" />}>
          {children}
        </Suspense>
      </div>
      {/* right section {session && <div className="max-w-[380px] px-6 flex-1 lg:block hidden" />} */}
    </>
  );
}
