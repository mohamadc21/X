import { auth } from "@/app/_lib/auth";
import { Metadata } from "next";
import { signinWithCredentials } from "../_lib/actions";
import { redirect } from "next/navigation";

export async function generateMetadata(): Promise<Metadata | void> {
  const session = await auth();
  if (session?.user) {
    return {
      title: "X, it's what's happening"
    }
  }
}

export default async function Page() {
  await signinWithCredentials({ email_username: 'wyattmohammad1371017@gmail.com', password: '123' });
  redirect('/home');
}
