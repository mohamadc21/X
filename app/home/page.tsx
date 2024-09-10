import { Metadata } from "next";
import React from "react";
import { auth } from "../lib/auth";
import { redirect } from "next/navigation";
import TwittsWrapper from "../ui/TwittsWrapper";

export const metadata: Metadata = {
  title: "Home"
}

async function Page() {
  const session = await auth();
  if (!session) redirect('/i/flow/login');

  return (
    <div className="flex-1 lg:max-w-full">
      <TwittsWrapper />
    </div>
  )
}

export default Page;
