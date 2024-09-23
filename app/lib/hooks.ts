import { useDispatch, useSelector, useStore } from 'react-redux';
import { AppDispatch, AppStore, RootState } from "./store";
import React, { useEffect, useState } from "react";
import { ModalProps } from "./definitions";

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppStore = useSelector.withTypes<AppStore>();

export const useIsVisible = (ref: React.RefObject<HTMLElement>) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !isVisible) {
        setIsVisible(true);
      }
    });

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.disconnect();
      }
    }
  }, [ref, isVisible]);

  return isVisible;
}


export const useModalProps = (props?: ModalProps): ModalProps => {
  const [inMobile, setInMobile] = useState(false);

  useEffect(() => {
    const inMobileCheck = () => {
      if (window?.innerWidth < 641) {
        setInMobile(true);
      } else setInMobile(false);
    }

    inMobileCheck();

    window.addEventListener('resize', inMobileCheck)

    return () => {
      window.removeEventListener('resize', inMobileCheck);
    }
  }, []);

  return {
    className: `bg-background min-h-[40dvh] ${props?.className || ''} `,
    defaultOpen: props?.defaultOpen || true,
    isDismissable: props?.isDismissable || false,
    classNames: {
      backdrop: `${props?.classNames?.backdrop} ${props?.defaultBackdrop || 'bg-gray-700/70'}`,
      header: `${props?.classNames?.header || ''} z-[3] bg-background`,
      body: `${props?.classNames?.body} ${props?.centerContent ? 'px-[80px]' : 'px-[20px]'} pb-4 pt-8 overflow-y-auto`,
      footer: `${props?.classNames?.footer} ${props?.centerContent ? 'px-[80px]' : 'px-[20px]'}`,
      closeButton: `text-xl left-2.5 right-[none] z-[4] top-3 ${props?.classNames?.closeButton}`,
    },
    radius: props?.radius || "lg",
    scrollBehavior: inMobile ? undefined : (props?.scrollBehavior || "inside"),
    size: inMobile ? 'full' : (props?.size || "md"),
    shouldBlockScroll: props?.shouldBlockScroll || true
  }
} 