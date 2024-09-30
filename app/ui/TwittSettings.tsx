import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@nextui-org/react";
import React, { Key } from "react";
import { BsStars } from "react-icons/bs";
import { FaRegComment } from "react-icons/fa";
import { GoTrash } from "react-icons/go";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import { LuUserPlus } from "react-icons/lu";
import { MdBlock, MdOutlinePushPin } from "react-icons/md";
import { RiPagesLine } from "react-icons/ri";
import { ITwitt, SessionUser } from "@/app/lib/definitions";

function TwittSettings({ onMenuAction, twitt, user }: { onMenuAction: (e: Key) => void, twitt: ITwitt, user: SessionUser }) {
  return (
    <Dropdown className="bg-background">
      <DropdownTrigger>
        <Button
          variant="light"
          color="primary"
          isIconOnly
          size="sm"
          radius="full"
          startContent={
            <HiOutlineDotsHorizontal
              size="18"
              className="text-default-400 group-hover:text-primary"
            />
          }
        ></Button>
      </DropdownTrigger>
      <DropdownMenu
        variant="shadow"
        style={{
          boxShadow: "0 0 8px hsl(var(--nextui-default-400))",
        }}
        className="rounded-2xl overflow-hidden bg-background p-0"
        itemClasses={{
          base: "bg-background border-none text-lg hover:bg-default/20 p-3 w-full",
          title: "text-base font-bold",
        }}
        onAction={onMenuAction}
      >
        <DropdownItem
          className="text-red-500"
          key="delete"
          hidden={twitt.user_id != user.id}
          startContent={<GoTrash />}
        >
          Delete
        </DropdownItem>
        <DropdownItem key="follow" hidden={twitt.user_id == user.id} startContent={<LuUserPlus />}>
          Follow @{twitt.username}
        </DropdownItem>
        <DropdownItem key="block" hidden={twitt.user_id == user.id} startContent={<MdBlock />}>
          Block @{twitt.username}
        </DropdownItem>
        <DropdownItem
          key="pin"
          startContent={<MdOutlinePushPin />}
        >
          Pin to your profile
        </DropdownItem>
        <DropdownItem key="highlight" startContent={<BsStars />}>
          Highlight on your profile
        </DropdownItem>
        <DropdownItem
          key="add-remove"
          startContent={<RiPagesLine />}
        >
          Add/remove @{twitt.username} from Lists
        </DropdownItem>
        <DropdownItem
          hidden={twitt.user_id != user.id}
          key="change-reply"
          startContent={<FaRegComment />}
        >
          Change who can reply
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  )
}

export default TwittSettings;
