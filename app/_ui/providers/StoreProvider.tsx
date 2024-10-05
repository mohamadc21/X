"use client";

import { AppStore, store } from "@/app/_lib/store";
import React, { useRef } from "react";
import { Provider } from "react-redux";
import { useAppSelector } from "@/app/_lib/hooks";
import LoadingSpinner from "../LoadingSpinner";
import { Modal } from "@nextui-org/modal";

function StoreProvider({ children }: { children: React.ReactNode }) {
  const storeRef = useRef<AppStore>();
  if (!storeRef.current) {
    storeRef.current = store();
  }

  return (
    <Provider store={storeRef.current}>
      <AppProvider>
        {children}
      </AppProvider>
    </Provider>
  );
};

function AppProvider({ children }: { children: React.ReactNode }) {
  const isChangingRoute = useAppSelector(state => state.app.isChangingRoute);
  return (
    <>
      {isChangingRoute && (
        <Modal isOpen shouldBlockScroll>
          <div className="bg-gray-700/40 fixed z-10 inset-0 flex items-center justify-center">
            <LoadingSpinner noPadding />
          </div>
        </Modal>
      )}
      {children}
    </>
  )
}

export default StoreProvider;
