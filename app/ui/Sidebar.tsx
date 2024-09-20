import { Avatar, Button } from "@nextui-org/react";
import { auth } from "../lib/auth";
import Navigation from "./Navigation";
import Image from "next/image";
import BottomNavigation from "./BottomNavigation";

async function Sidebar() {
  const session = await auth();

  return (
    <>
      <Navigation session={session!} />
      <BottomNavigation session={session!} />
    </>
  )
}

export default Sidebar;
