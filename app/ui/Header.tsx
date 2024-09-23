import { Session } from "next-auth";
import Image from "next/image";
import React from "react";
import Logo from "./Logo";
import Link from "next/link";
import { Button } from "@nextui-org/button";

function Header({ user }: { user: Session['user'] }) {
  return (
    <header className="sm:hidden sticky top-0 left-0 w-full flex items-center py-3 px-4 border-b border-default bg-background">
      <div className="flex items-center justify-between w-full">
        <Button className="rounded-full w-[30px] h-[30px] min-w-0 p-0" isIconOnly>
          <Image
            width={30}
            height={30}
            priority={true}
            src={user?.image || '/default_white.jpg'}
            alt={user.name!}
            className="rounded-full w-[30px] h-[30px]"
          />
        </Button>
        <Logo className="absolute left-1/2 -translate-x-1/2" width={27} height={27} />
        <Link href="#">Get Premium</Link>
      </div>
    </header>
  )
}

export default Header;
