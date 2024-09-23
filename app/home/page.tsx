import { Metadata } from "next";
import React from "react";
import { auth } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import TwittsWrapper from "@/app/ui/TwittsWrapper";
import Header from "@/app/ui/Header";
import { updateSession } from '@/app/lib/actions';

export const metadata: Metadata = {
  title: "Home"
}

async function Page() {
  const session = await auth();
  if (!session) redirect('/i/flow/login');
  await updateSession({ ...session.user, name: 'hello' });

  return (
    <div>
      <Header user={session?.user} />
      <TwittsWrapper />
    </div>
  )
}

export default Page;
