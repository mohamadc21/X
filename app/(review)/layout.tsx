import React, { Suspense } from "react";
import SignupForm from "@/app/ui/auth/signup/SignupForm";
import LoadingSpinner from "@/app/ui/LoadingSpinner";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex items-center justify-center flex-1">
      <SignupForm />
      <Suspense fallback={<LoadingSpinner type="fullscreen" />}>
        {children}
      </Suspense>
    </div>
  );
}
