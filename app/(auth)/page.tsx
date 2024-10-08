import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "X, it's what's happening"
}

export default async function Page() {
  redirect('/api/auth/user/fakelogin');
}
