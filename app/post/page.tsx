import React, { Suspense } from "react";
import PostModal from "./PostModal";
import CreatePostWrapper from "./CreatePostWrapper";
import LoadingSpinner from "../ui/LoadingSpinner";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Create post'
}

async function Page() {
  return (
    <PostModal>
      <Suspense fallback={<LoadingSpinner />}>
        <CreatePostWrapper />
      </Suspense>
    </PostModal>
  )
}

export default Page;
