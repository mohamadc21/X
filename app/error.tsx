"use client"

import { Button } from "@nextui-org/button";
import { useDisclosure } from "@nextui-org/modal";
import { useEffect, useState } from "react";
import { TbReload } from "react-icons/tb";

function Error({ error, reset }: { error: Error & { digest?: string }, reset: () => void }) {
  const [text, setText] = useState('Something went wrong. try reloading.');
  const { isOpen, onOpenChange, onOpen } = useDisclosure()

  useEffect(() => {
    onOpen();
    // setText(error.name);
  }, [error])
  return (
    <div className="flex flex-col items-center justify-center flex-1">
      <h1 className="text-lg mb-4 text-default-400">{text}</h1>
      <Button color="primary" radius="full" className="w-max gap-1 text-base font-bold" onClick={reset}><TbReload size={20} /><span>Retry</span></Button>
    </div>
  )
}

export default Error;
