import React, { Suspense } from "react";
import PostModal from "@/app/ui/createPost/PostModal";
import CreatePostWrapper from "@/app/ui/createPost/CreatePostWrapper";
import LoadingSpinner from "@/app/ui/LoadingSpinner";
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
