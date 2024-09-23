import { Metadata } from "next";
import React from "react";
import { auth } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import TwittsWrapper from "@/app/ui/TwittsWrapper";
import Header from "@/app/ui/Header";

export const metadata: Metadata = {
  title: "Home"
}

async function Page() {
  const session = await auth();
  if (!session) redirect('/i/flow/login');
  return (
    <div>
      <Header user={session?.user} />
      <TwittsWrapper />
    </div>
  )
}

export default Page;
