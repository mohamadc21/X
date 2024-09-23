import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getUserByUsername, getUserFollowersAndFollowings } from "@/app/lib/db";
import TwittsList from "@/app/ui/TwittsList";
import { auth } from "@/app/lib/auth";

export async function generateMetadata({ params }: { params: { userId: string } }): Promise<Metadata | void> {
  const user = await getUserByUsername(params.userId);
  if (user) {
    return {
      title: `Posts with replies by ${user.name}`
    }
  }
}

async function Page({ params }: { params: { userId: string } }) {
  const [user, session] = await Promise.all([
    getUserByUsername(params.userId),
    auth()
  ]);
  if (!user) notFound();
  const follows = await getUserFollowersAndFollowings(user.id);

  return (
    <TwittsList session={session} allTwitts={user.twitts} />
  )
}

export default Page;
