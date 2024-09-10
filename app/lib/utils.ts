import { ModalProps } from "./definitions";

export const modalProps = (props?: ModalProps): ModalProps => {
  let inMobile = false;
  const inMobileCheck = () => {
    if (window?.innerWidth < 641) {
      inMobile = true;
    } else inMobile = false;
  }

  if (typeof window !== undefined) {
    window.addEventListener('resize', inMobileCheck)
  }

  return {
    className: `${props?.className || ''} bg-background  overflow-hidden min-h-[40dvh]`,
    defaultOpen: props?.defaultOpen || true,
    classNames: {
      backdrop: `${props?.classNames?.backdrop} bg-gray-700/70`,
      body: `${props?.classNames?.body} ${props?.centerContent ? 'px-[80px]' : 'px-[20px]'} pb-4 pt-7`,
      footer: `${props?.classNames?.footer} ${props?.centerContent ? 'px-[80px]' : 'px-[20px]'} py-4`,
      closeButton: `${props?.classNames?.closeButton} text-xl right-2 top-2`,
    },
    radius: props?.radius || "lg",
    scrollBehavior: inMobile ? undefined : (props?.scrollBehavior || "inside"),
    size: inMobile ? 'full' : (props?.size || "md"),
    shouldBlockScroll: props?.shouldBlockScroll || true
  }
} 