import React from "react";
import CreatePost from "./CreatePost";
import { auth } from "../lib/auth";

async function CreatePostWrapper() {
  const session = await auth();
  if (!session?.user) return;
  return (
    <CreatePost user={session?.user} />
  )
}

export default CreatePostWrapper;
