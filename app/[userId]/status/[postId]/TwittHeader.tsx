"use client";

import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button } from "@nextui-org/button";
import { useRouter } from "next/navigation";

function TwittHeader() {
  const router = useRouter();

  return (
    <header className="sticky top-0 left-0 w-full bg-background/40 backdrop-blur-sm flex items-center gap-4 px-2 py-1.5 z-[3]">
      <Button variant="light" className="text-lg" radius="full" isIconOnly onClick={() => router.back()}>
        <ArrowLeftOutlined />
      </Button>
      <h2 className="text-xl leading-5 font-bold">Post</h2>
    </header>
  )
}

export default TwittHeader;