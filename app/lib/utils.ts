import { useEffect, useState } from "react";
import { ModalProps } from "./definitions";

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
    className: `${props?.className || ''} bg-background  overflow-hidden min-h-[40dvh]`,
    defaultOpen: props?.defaultOpen || true,
    isDismissable: props?.isDismissable || false,
    classNames: {
      backdrop: `${props?.classNames?.backdrop} bg-gray-700/70`,
      body: `${props?.classNames?.body} ${props?.centerContent ? 'px-[80px]' : 'px-[20px]'} pb-4 pt-8`,
      footer: `${props?.classNames?.footer} ${props?.centerContent ? 'px-[80px]' : 'px-[20px]'}`,
      closeButton: `${props?.classNames?.closeButton} text-lg left-2.5 right-[none] top-3`,
    },
    radius: props?.radius || "lg",
    scrollBehavior: inMobile ? undefined : (props?.scrollBehavior || "inside"),
    size: inMobile ? 'full' : (props?.size || "md"),
    shouldBlockScroll: props?.shouldBlockScroll || true
  }
} 