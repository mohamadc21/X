import React, { Suspense } from "react";
import TwittWrapper from "./TwittWrapper";
import TwittHeader from "./TwittHeader";
import LoadingSpinner from "@/app/ui/LoadingSpinner";

function Page({ params }: { params: { postId: string } }) {
  return (
    <div className="sm:border-x border-x-default flex-1 lg:max-w-full max-w-[600px] min-h-[100dvh]">
      <TwittHeader />
      <Suspense fallback={<LoadingSpinner />}>
        <TwittWrapper postId={params.postId} />
      </Suspense>
    </div>
  )
}

export default Page;
