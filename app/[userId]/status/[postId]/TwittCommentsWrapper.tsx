import { getTwittComments } from "@/app/lib/actions";
import { auth } from "@/app/lib/auth";
import TwittsList from "@/app/ui/TwittsList";
import React from "react";

async function TwittCommentsWrapper({ postId }: { postId: string }) {
  const [session, twitts] = await Promise.all([
    auth(),
    getTwittComments(postId)
  ])

  return (
    <TwittsList twittId={postId} type="comments" allTwitts={twitts} session={session} />
  )
}

export default TwittCommentsWrapper;
