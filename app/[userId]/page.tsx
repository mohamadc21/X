import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getUserByUsername, getUserFollowersAndFollowings } from "@/app/lib/db";
import TwittsList from "@/app/ui/TwittsList";
import { auth } from "@/app/lib/auth";
import UserProfile from "./UserProfile";

export async function generateMetadata({ params }: { params: { userId: string } }): Promise<Metadata> {
  const user = await getUserByUsername(params.userId);
  return {
    title: user ? `${user.name} (@${user.username})` : "Profile"
  }
}

async function Page({ params }: { params: { userId: string } }) {
  const [user, session] = await Promise.all([
    getUserByUsername(params.userId),
    auth()
  ]);
  if (!user) notFound();
  const twittsWithoutReply = user.twitts.filter(twitt => twitt.reply_to === null);

  return (
    <TwittsList session={session} allTwitts={twittsWithoutReply} />
  )
}

export default Page;
