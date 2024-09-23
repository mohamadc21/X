import { auth } from "../lib/auth";
import BottomNavigation from "./BottomNavigation";
import Navigation from "./Navigation";

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
