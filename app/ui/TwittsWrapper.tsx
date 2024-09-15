import React, { Suspense } from "react";
import { auth } from "../lib/auth";
import { getAlltwitts, getTwittComments } from "../lib/db";
import TwittsList from "./TwittsList";
import LoadingSpinner from "./LoadingSpinner";
import CreatePost from "./CreatePost";
import { Session } from "next-auth";
import { ITwitt } from "../lib/definitions";

async function TwittsWrapper() {
  const session = await auth();
  return (
    <div className="sm:pt-3 sm:min-h-[98vh] overflow-hidden w-full sm:mb-0 mb-11 sm:border-x border-default">
      <div className="sm:block hidden border-b border-default">
        <CreatePost user={session?.user!} />
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
