import { auth } from "@/app/lib/auth";
import LoginFlow from "@/app/(auth)/i/flow/login/LoginFlow";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await auth();

  if (session) redirect('/');

  return (
    <LoginFlow />
  )
}