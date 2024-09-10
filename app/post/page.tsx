import React, { Suspense } from "react";
import PostModal from "./PostModal";
import CreatePostWrapper from "./CreatePostWrapper";
import LoadingSpinner from "../ui/LoadingSpinner";

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
