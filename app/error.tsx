"use client"

import { Button } from "@nextui-org/button";
import { Modal, ModalBody, ModalContent, ModalHeader } from "@nextui-org/modal";
import React, { useEffect } from "react";
import { useModalProps } from "./lib/utils";

function Error({ error, reset }: { error: Error, reset: () => void }) {
  const modalProps = useModalProps;

  useEffect(() => {
    console.error(error);
  }, [error])

  return (
    <Modal {...modalProps}>
      <ModalContent className="flex items-center justify-center ">
        <ModalHeader>
          <h1 className="text-xl">An error occurred</h1>
        </ModalHeader>
        <ModalBody>
          <Button className="w-max font-bold" onClick={reset}>Try again</Button>

        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default Error;
