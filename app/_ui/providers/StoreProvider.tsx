"use client";

import { AppStore, store } from "@/app/_lib/store";
import React, { useEffect, useRef } from "react";
import { Provider } from "react-redux";
import { useAppDispatch, useAppSelector } from "@/app/_lib/hooks";
import LoadingSpinner from "../LoadingSpinner";
import { Modal } from "@nextui-org/modal";
import useSWR from "swr";
import { setNotifications } from "@/app/_lib/slices/appSlice";
import { readNotifications } from "@/app/_lib/actions";

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
  const { isChangingRoute, notifications } = useAppSelector(state => state.app);
  const dispatch = useAppDispatch();
  useSWR('/api/user/notifications', async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/user/notifications`);
    const data = await res.json();
    if (data) {
      dispatch(setNotifications(data));
    }
  }, {
    refreshInterval: 10000
  });

  async function showNotifs() {
    if (notifications.length === 0) return;
    if (Notification.permission === 'granted') {
      notifications.forEach(async notif => {
        let title = '';
        if (notif.type === 'like') {
          title = `${notif.name} liked your post`
        }
        if (notif.type === 'follow') {
          title = `${notif.name} started to following you`
        }
        if (notif.type === 'reply') {
          title = `${notif.name} replyed to your post`
        }
        if (notif.notified === 0) {
          new Notification(title, {
            icon: notif.profile,
          });
          await readNotifications({ onlyNotified: true });
        }
      })
    }
  }

  useEffect(() => {
    showNotifs();
  }, [notifications]);

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
