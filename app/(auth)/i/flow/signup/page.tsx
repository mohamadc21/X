import React from "react";
import CredentialsFlow from "@/app/home/(auth)/i/flow/signup/credentials/CredentailsFlow";
import { Metadata } from "next";
import { auth } from "@/app/lib/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Sign up for X"
};

async function Page() {
  const session = await auth();

  if (session) redirect('/');

  return (
    <CredentialsFlow />
  )
}

export default Page;
