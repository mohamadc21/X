import { auth } from "@/app/_lib/auth";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata | void> {
  const session = await auth();
  if (session?.user) {
    return {
      title: "X, it's what's happening"
    }
  }
}

export default function Page() {
}
