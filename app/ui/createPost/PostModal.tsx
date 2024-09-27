"use client";

import { useAppDispatch, useModalProps } from "@/app/lib/hooks";
import { setReplyTo } from "@/app/lib/slices/appSlice";
import { Modal, ModalContent, ModalHeader, useDisclosure } from "@nextui-org/modal";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";


function PostModal({ children }: { children: React.ReactNode }) {
  const { onOpen, isOpen, onClose } = useDisclosure();
  const router = useRouter();
  const modalProps = useModalProps;
  const dispatch = useAppDispatch();

  useEffect(() => {
    onOpen();
  }, [])

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          onClose();
          router.back();
        }
      }}
      onClose={() => {
        dispatch(setReplyTo(null));
      }}
      size="full"
      placement="top"
    >
      <ModalContent>
        <ModalHeader />
        {children}
      </ModalContent>
    </Modal>
  )
}

export default PostModal;
