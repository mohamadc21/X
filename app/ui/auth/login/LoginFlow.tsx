"use client";

import { useAppSelector } from "@/app/lib/hooks";
import { modalProps } from "@/app/lib/utils";
import { Modal, ModalBody, ModalContent, ModalHeader, useDisclosure } from "@nextui-org/modal";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, useTransition } from "react";
import LoadingSpinner from "@/app/ui/LoadingSpinner";
import LoginForm from "./LoginForm";
import Logo from "@/app/ui/Logo";
import Step2 from "./Step2";

function LoginFlow() {
  const [isPending, startTransition] = useTransition();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const currentStep = useAppSelector(state => state.user.login.step);

  function onTransition(callback: Function) {
    startTransition(async () => await callback());
  }

  useEffect(() => {
    setIsMounted(true);
    if (!isOpen) onOpen();
  }, [isOpen, onOpen])

  useEffect(() => {
    if (isMounted) {
      if (!isOpen) router.push('/');
    }
  }, [onOpenChange, isMounted, isOpen, router]);

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      {...modalProps({ className: "min-h-[90dvh] overflow-hidden", size: "xl", centerContent: true })}
    >
      <ModalContent>
        <ModalHeader className="mx-auto">
          <Logo width={27} height={27} />
        </ModalHeader>
        {currentStep === 1 && (
          <LoginForm onTransition={onTransition} />
        )}
        {currentStep === 2 && <Step2 onTransition={onTransition} />}
        {isPending && (
          <div className="absolute inset-0 z-10 bg-background flex items-center justify-center">
            <LoadingSpinner />
          </div>
        )}
      </ModalContent>
    </Modal>
  )
}

export default LoginFlow;
