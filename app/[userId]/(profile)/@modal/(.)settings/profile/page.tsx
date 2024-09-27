import React from "react";
import ProfileEditModal from "@/app/ui/ProfileEditModal";
import { auth } from "@/app/lib/auth";
import { getUserById } from "@/app/lib/actions";

async function Page() {
  const session = await auth();
  if (!session) return;
  const user = await getUserById(session.user.id!);
  if (!user) return;

  return (
    <ProfileEditModal user={user} />
  )
}

export default Page;
