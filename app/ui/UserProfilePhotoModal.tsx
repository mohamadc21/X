"use client";

import { useAppSelector } from "@/app/lib/hooks";
import { useModalProps } from "@/app/lib/hooks";
import { Modal, ModalBody, ModalContent, useDisclosure } from "@nextui-org/modal";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect } from "react";

function UserProfilePhotoModal({ mode }: { mode: 'profile' | 'header' }) {
  const { isOpen, onOpen } = useDisclosure();
  const userInfo = useAppSelector(state => state.user.user.info);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    onOpen();
  }, [pathname]);

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          router.back();
        }
      }}
      {...useModalProps({ defaultBackdrop: true, className: "bg-transparent shadow-none", isDismissable: true, classNames: { closeButton: "fixed left-6" } })}
    >
      <ModalContent>
        {mode === 'header' ? (
          <div className="fixed top-1/2 -translate-y-1/2 left-0 right-0 flex items-center justify-center h-[400px]">
            <Image src={userInfo?.header_photo!} className="object-cover" alt={userInfo?.name!} fill />
          </div>
        ) : (
          <ModalBody className="flex items-center justify-center">
            <Image src={userInfo?.profile!} objectFit="cover" alt={userInfo?.name!} width={400} height={400} className="rounded-full w-[400px] h-[400px] object-cover" />
          </ModalBody>
        )}
      </ModalContent>
    </Modal>
  )
}

export default UserProfilePhotoModal;
