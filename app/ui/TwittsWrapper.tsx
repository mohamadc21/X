import React, { Suspense } from "react";
import { auth } from "../lib/auth";
import { getAlltwitts } from "../lib/db";
import TwittsList from "./TwittsList";
import LoadingSpinner from "./LoadingSpinner";
import CreatePost from "./CreatePost";

async function TwittsWrapper() {
  return (
    <div className="pt-3 min-h-[98dvh] overflow-hidden w-full">
      <Suspense fallback={<LoadingSpinner noPadding />}>
        <Twitts />
      </Suspense>
    </div>
  )
}

async function Twitts() {
  const session = await auth();
  const allTwitts = await getAlltwitts();

  return (
    <>
      <CreatePost user={session?.user!} />
      <TwittsList session={session!} allTwitts={allTwitts} />
    </>
  )
}

export default TwittsWrapper;
