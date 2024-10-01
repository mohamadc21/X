import React, { Suspense } from "react";
import PostModal from "@/app/_ui/createPost/PostModal";
import CreatePostWrapper from "@/app/_ui/createPost/CreatePostWrapper";
import LoadingSpinner from "@/app/_ui/LoadingSpinner";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Create post'
}

function Page() {
  return (
    <PostModal>
      <Suspense fallback={<LoadingSpinner />}>
        <CreatePostWrapper />
      </Suspense>
    </PostModal>
  )
}

export default Page;
