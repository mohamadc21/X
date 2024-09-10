"use client";

import { addTwitt } from "@/app/lib/actions";
import { useModalProps } from "@/app/lib/utils";
import { Modal, ModalContent, ModalHeader, useDisclosure } from "@nextui-org/modal";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";


function PostModal({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);
  const { onOpenChange, onOpen, isOpen } = useDisclosure();
  const router = useRouter();
  const modalProps = useModalProps;

  useEffect(() => {
    setIsMounted(true);
    if (!isOpen) onOpen();
  }, [isOpen, onOpen])

  useEffect(() => {
    if (isMounted) {
      if (!isOpen) router.back();
    }
  }, [onOpenChange, isMounted, isOpen, router]);

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      {...modalProps({ size: "xl" })}
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
