import React from "react";
import CreatePost from "@/app/ui/createPost/CreatePost";
import { auth } from "../../lib/auth";

async function CreatePostWrapper() {
  const session = {
    user: {
      id: 'awewa',
      name: 'awewa',
      email: 'saewa',
      image: 'https://img-s-msn-com.akamaized.net/tenant/amp/entityid/BB1msIoO.img',
      username: 'aweaw'
    }
  };
  if (!session?.user) return;
  return (
    <CreatePost
      user={session.user}
      asModal
    />
  )
}

export default CreatePostWrapper;
