import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getUserByUsername, getUserFollowersAndFollowings } from "@/app/lib/db";
import TwittsList from "@/app/ui/TwittsList";
import { auth } from "@/app/lib/auth";
import UserProfile from "../UserProfile";

export async function generateMetadata({ params }: { params: { userId: string } }): Promise<Metadata | void> {
  const user = await getUserByUsername(params.userId);
  if (user) {
    return {
      title: `Media Posts by ${user.name}`
    }
  }
}

async function Page({ params }: { params: { userId: string } }) {
  const [user, session] = await Promise.all([
    getUserByUsername(params.userId),
    auth()
  ]);
  if (!user) notFound();

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-center">You haven&apos;t posted any medias such as photos, videos or gifs</h1>
    </div>
  )
}

export default Page;
