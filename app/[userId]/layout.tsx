import React from "react";
import { User } from "../lib/definitions";
import { getUserByUsername, getUserFollowersAndFollowings } from "@/app/lib/actions";
import { auth } from "../lib/auth";
import UserProfile from "./UserProfile";
import { notFound } from "next/navigation";

async function Layout({ children, modal, params }: { children: React.ReactNode, modal: React.ReactNode, params: { userId: string } }) {
  const [session, user] = await Promise.all([
    auth(),
    getUserByUsername(params.userId),
  ]);
  if (!user) notFound();

  const follows = await getUserFollowersAndFollowings(user.id);
  const userInfo: User = {
    id: user.id,
    name: user.name,
    username: user.username,
    password: '',
    email: user.email,
    bio: user.bio,
    website: user.website,
    location: user.location,
    header_photo: user.header_photo,
    profile: user.profile,
    birthday: user.birthday,
    created_at: user.created_at.toString(),
    updated_at: user.updated_at.toString()
  };

  return (
    <>
      <UserProfile user={userInfo} headerSubtitle={`${user.twitts.length} post${user.twitts.length! > 0 ? 's' : ''}`} follows={follows} sessionUser={session?.user!}>
        {modal}
        {children}
      </UserProfile>
    </>
  )
}

export default Layout;
