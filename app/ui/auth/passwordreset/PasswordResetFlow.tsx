"use client";

import { useModalProps } from "@/app/lib/utils";
import { Modal, ModalContent, ModalHeader, useDisclosure } from "@nextui-org/modal";
import { useRouter } from "next/navigation";
import React, { Dispatch, SetStateAction, useEffect, useState, useTransition } from "react";
import LoadingSpinner from "@/app/ui/LoadingSpinner";
import Step1 from "./Step1";
import Step2 from "./Step2";
import Logo from "../../Logo";
import Alert from "../../Alert";
import Step3 from "./Step3";

type PasswordResetFlow = {
  identy: string,
  email: string | null,
  code: string,
  error: string | null,
  step: 1 | 2 | 3
}

export type StepsProps = {
  flow: PasswordResetFlow,
  setFlow: Dispatch<SetStateAction<PasswordResetFlow>>,
  onTransition: (callback: () => Promise<any>) => void
}

function PasswordResetFlow() {
  const [isPending, startTransition] = useTransition();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const [flow, setFlow] = useState<PasswordResetFlow>({
    identy: '',
    code: '',
    email: null,
    error: null,
    step: 1
  });
  const modalProps = useModalProps;

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
        {flow.step === 1 && <Step1 onTransition={onTransition} flow={flow} setFlow={setFlow} />}
        {flow.step === 2 && <Step2 onTransition={onTransition} flow={flow} setFlow={setFlow} />}
        {flow.step === 3 && <Step3 onTransition={onTransition} flow={flow} setFlow={setFlow} />}
        {isPending && (
          <div className="absolute inset-0 z-10 bg-background flex items-center justify-center">
            <LoadingSpinner />
          </div>
        )}
        {flow.error && (
          <Alert>{flow.error}</Alert>
        )}
      </ModalContent>
    </Modal>
  )
}

export default PasswordResetFlow;
