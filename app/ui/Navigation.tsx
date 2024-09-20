"use client";

import React, { useEffect, useState } from "react";
import Logo from "@/app/ui/Logo";
import { GoHomeFill, GoHome } from "react-icons/go";
import { PiDotsThreeCircleLight } from "react-icons/pi";
import { Button } from "@nextui-org/button";
import { IoIosSearch, } from "react-icons/io";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BiSolidUser, BiUser } from "react-icons/bi";
import { IoNotifications, IoNotificationsOutline } from "react-icons/io5";
import { IoMail, IoMailOutline } from "react-icons/io5";
import { Badge } from "@nextui-org/react";
import { Session } from "next-auth";
import Image from "next/image";


function Navigation({ session }: { session: Session }) {
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();

  const links = [
    {
      href: '/home',
      text: 'Home',
      logo: {
        outline: <GoHome size={30} />,
        filled: <GoHomeFill size={30} />,
      },
    },
    {
      href: '/explore',
      text: 'Explore',
      logo: {
        outline: <IoIosSearch size={30} />,
        filled: <IoIosSearch size={30} />,
      },
    },
    {
      href: '/notifications',
      text: 'Notifications',
      logo: {
        outline: <IoNotificationsOutline size={30} />,

        filled: <IoNotifications size={30} />,
      },
    },
    {
      href: '/messages',
      text: 'Messages',
      logo: {
        outline: <IoMailOutline size={30} />,
        filled: <IoMail size={30} />,
      },
    },
    {
      href: `/${session.user.username}`,
      text: 'Profile',
      logo: {
        outline: <BiUser size={30} />,
        filled: <BiSolidUser size={30} />,
      },
    },
    {
      href: null,
      text: 'More',
      logo: {
        outline: <PiDotsThreeCircleLight size={30} />,
        filled: <PiDotsThreeCircleLight size={30} />
      }
    },
  ]

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <>
      <ul className="hidden sm:flex flex-col xl:items-stretch items-center gap-2 w-full max-w-[235px]">
        <li>
          <Button as={Link} href="/home" size="lg" isIconOnly className=" flex hover:no-underline min-w-max items-center xl:px-3 justify-center gap-4 text-xl" variant="light" radius="full">
            <Logo width={30} height={30} />
          </Button>
        </li>
        {links.map((link, idx) => (
          <li key={idx}>
            {idx === 0 ? (
              <>
                <Button as={link?.href ? Link : "button"} href={link?.href || undefined} variant="light" size="lg" className="xl:flex hidden w-full hover:no-underline px-3 min-w-max items-center justify-start gap-4 text-xl" radius="full">
                  <Badge content="" size="sm" color="primary">
                    {pathname === link.href ? link.logo.filled : link.logo.outline}
                  </Badge>
                  <span className={`xl:block hidden ${pathname === link.href ? 'font-bold' : ''}`}>{link?.text}</span>
                </Button>
                <Button variant="light" as={link?.href ? Link : "button"} href={link?.href || undefined} size="lg" isIconOnly className="xl:hidden flex hover:no-underline  min-w-max items-center justify-center gap-4 text-xl" radius="full">
                  <Badge content="" size="sm" color="primary">
                    {pathname === link.href ? link.logo.filled : link.logo.outline}
                  </Badge>
                </Button>
              </>
            ) : (
              <>
                <Button variant="light" as={link?.href ? Link : "button"} href={link?.href || undefined} size="lg" className="xl:flex hidden w-full hover:no-underline px-3 min-w-max items-center justify-start gap-4 text-xl" radius="full">
                  {pathname === link.href ? link.logo.filled : link.logo.outline}
                  <span className={`xl:block hidden ${pathname === link.href ? 'font-bold' : ''}`}>{link?.text}</span>
                </Button>

                <Button variant="light" as={link?.href ? Link : "button"} href={link?.href || undefined} size="lg" isIconOnly className="xl:hidden flex hover:no-underline  min-w-max items-center justify-center gap-4 text-xl" radius="full">
                  {pathname === link.href ? link.logo.filled : link.logo.outline}
                </Button>
              </>
            )}
          </li>
        ))}
        <li>
          <Button color="primary" as={Link} href="/post" size="lg" className="hidden xl:flex w-full hover:no-underline px-3 items-center gap-4 text-xl font-medium" radius="full">
            <span className="xl:block hidden">Post</span>
          </Button>
          <Button color="primary" as={Link} href="/post" size="lg" isIconOnly className="xl:hidden flex hover:no-underline  min-w-max items-center justify-center gap-4 text-xl" radius="full">
            <svg width={25} height={25} fill="#fff" viewBox="0 0 24 24" aria-hidden="true" className="r-4qtqp9 r-yyyyoo r-dnmrzs r-bnwqim r-lrvibr r-m6rgpd r-1472mwg r-lrsllp" style={{ color: "rgb(255, 255, 255)" }}><g><path d="M23 3c-6.62-.1-10.38 2.421-13.05 6.03C7.29 12.61 6 17.331 6 22h2c0-1.007.07-2.012.19-3H12c4.1 0 7.48-3.082 7.94-7.054C22.79 10.147 23.17 6.359 23 3zm-7 8h-1.5v2H16c.63-.016 1.2-.08 1.72-.188C16.95 15.24 14.68 17 12 17H8.55c.57-2.512 1.57-4.851 3-6.78 2.16-2.912 5.29-4.911 9.45-5.187C20.95 8.079 19.9 11 16 11zM4 9V6H1V4h3V1h2v3h3v2H6v3H4z"></path></g></svg>
          </Button>

        </li>
      </ul>

      {session?.user && (
        <>
          <Button size="lg" variant="light" className="xl:px-3 py-7 px-7 xl:justify-start justify-center items-center w-full max-w-[235px] hidden xl:flex" radius="full">
            <div className="flex items-center justify-center overflow-hidden gap-3">
              <Image width={44} height={44} priority={true} alt={session?.user?.name!} src={session.user.image || '/default_white.jpg'} className="rounded-full w-11 h-11" />
              <div className="text-left xl:flex flex-col items-start justify-center hidden gap-0 truncate">
                <h3 className="font-bold truncate max-w-full">{session.user.name}</h3>
                <p className="text-darkgray truncate max-w-full">@{session.user.username} aweaw wae</p>
              </div>
            </div>
          </Button>
          <Button size="lg" variant="light" className="xl:px-3 xl:py-7 xl:justify-start justify-center items-center sm:flex hidden min-w-0" isIconOnly radius="full">
            <div className="flex items-center justify-center gap-3">
              <Image width={44} height={44} priority={true} alt={session?.user?.name!} src={session.user.image || '/default_white.jpg'} className="rounded-full w-11 h-11" />
              <div className="text-left xl:flex flex-col items-start justify-center hidden gap-0">
                <h3 className="font-bold">{session.user.name}</h3>
                <p className="text-darkgray">@{session.user.username}</p>
              </div>
            </div>
          </Button>
        </>
      )}
    </>
  )
}

export default Navigation;
