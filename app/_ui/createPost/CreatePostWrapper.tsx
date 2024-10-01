import React from "react";
import CreatePost from "@/app/_ui/createPost/CreatePost";
import { auth } from "../../_lib/auth";

async function CreatePostWrapper() {
  const session = await auth();
  if (!session?.user) return;
  return (
    <CreatePost
      user={session.user}
      asModal
    />
  )
}

export default CreatePostWrapper;
