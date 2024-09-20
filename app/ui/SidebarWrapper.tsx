import React, { Suspense } from "react";
import LoadingSpinner from "./LoadingSpinner";
import Sidebar from "./Sidebar";

function SidebarWrapper() {
  return (
    <div className="sm:h-[98dvh] flex sm:flex-col justify-between items-center w-full xl:max-w-[300px] sm:max-w-[68px] max-w-full overflow-hidden text-foreground  py-1.5 gap-12 flex-1 sm:sticky sm:top-0 bg-background fixed bottom-0 sm:border-t-0 border-t border-default z-[3]">
      <Suspense fallback={<LoadingSpinner noPadding />}>
        <Sidebar />
      </Suspense>
    </div>
  )
}

export default SidebarWrapper;
