import React from "react";
import { getUserByUsername, getUserFollowersAndFollowings } from "@/app/_lib/actions";
import { auth } from "../../_lib/auth";
import UserProfile from "./UserProfile";
import { notFound } from "next/navigation";

async function Layout({ children, modal, params }: { children: React.ReactNode, modal: React.ReactNode, params: { userId: string } }) {
  const [session, user] = await Promise.all([
    auth(),
    getUserByUsername(params.userId),
  ]);
  if (!user) notFound();

  const follows = await getUserFollowersAndFollowings(user.id);

  return (
    <div className="flex-1 w-full max-w-2xl">
      <UserProfile user={user} headerSubtitle={`${user.twitts.length} post${user.twitts.length! > 0 ? 's' : ''}`} follows={follows} sessionUser={session?.user!}>
        {modal}
        {children}
      </UserProfile>
    </div>
  )
}

export default Layout;
