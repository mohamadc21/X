import { Session } from "next-auth";
import { Suspense } from "react";
import { auth } from "@/app/lib/auth";
import { getAlltwitts } from "@/app/lib/actions";
import CreatePost from "@/app/ui/createPost/CreatePost";
import LoadingSpinner from "./LoadingSpinner";
import TwittsList from "./TwittsList";

export const revalidate = 0;

async function TwittsWrapper({ session }: { session: Session }) {
  return (
    <div className="sm:pt-1.5 sm:min-h-[98vh] overflow-hidden w-full sm:mb-0 mb-11 sm:border-x border-default">
      <div className="sm:block hidden border-b border-default">
        <CreatePost user={session.user!} />
      </div>
      <Suspense fallback={<LoadingSpinner />}>
        <Twitts session={session} />
      </Suspense>
    </div>
  )
}

async function Twitts({ session }: { session: Session | null }) {
  const allTwitts = await getAlltwitts();

  return (
    <TwittsList
      session={session}
      allTwitts={allTwitts}
    />
  )
}

export default TwittsWrapper;
