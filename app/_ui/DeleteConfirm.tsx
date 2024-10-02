import { Button } from "@nextui-org/button";
import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from "@nextui-org/modal";
import React from "react";
import { useModalProps } from "../_lib/hooks";
import LoadingSpinner from "./LoadingSpinner";

function DeleteConfirm({ children, desc, action, onClose, pending }: { children: React.ReactNode, desc?: string, action: () => Promise<any> | any, onClose?: () => void, pending?: boolean }) {
    const { onClose: onModalClose } = useDisclosure();
    return (
        <Modal isOpen={true} onOpenChange={(isOpen) => {
            if (!isOpen) {
                onClose?.();
                onModalClose();
            }
        }}
            {...useModalProps({
                centerContent: false, isDismissable: true, ignureMobileSize: true,
            })}
            hideCloseButton
        >
            <ModalContent>
                <ModalBody>
                    <h2 className="text-xl font-bold">{children}</h2>
                    {desc && <p className="text-default-400">{desc}</p>}
                </ModalBody>
                <ModalFooter className="flex flex-col gap-3">
                    <Button isLoading={pending} spinner={<LoadingSpinner size="sm" />} radius="full" className="text-base" color="danger" onClick={async () => {
                        await action();
                        onClose?.();
                        onModalClose();
                    }} isDisabled={pending}>Delete</Button>
                    <Button variant="ghost" radius="full" className="text-base" onClick={() => {
                        onClose?.();
                        onModalClose();
                    }} isDisabled={pending}>Cancel</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}

export default DeleteConfirm;
