"use client";

import { addTwitt } from "@/app/lib/actions";
import LoadingSpinner from "@/app/ui/LoadingSpinner";
import { ModalBody, ModalFooter } from "@nextui-org/modal";
import { Avatar, Button, Textarea } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { BsEmojiSmile } from "react-icons/bs";
import { CgOptions } from "react-icons/cg";
import { IoLocationOutline } from "react-icons/io5";
import { LuImage } from "react-icons/lu";
import { MdGif } from "react-icons/md";
import { RiCalendarScheduleLine } from "react-icons/ri";
import { SessionUser } from "../lib/definitions";

const optionsIcons = [
  <LuImage size={18} className="text-primary" key="1" />,
  <MdGif size={18} className="text-primary" key="2" />,
  <CgOptions size={18} className="text-primary" key="3" />,
  <BsEmojiSmile size={18} className="text-primary" key="4" />,
  <RiCalendarScheduleLine size={18} className="text-primary" key="5" />,
  <IoLocationOutline size={18} className="text-primary" key="6" />
]

function CreatePost({ user }: { user: SessionUser }) {
  const [isPending, startTransition] = useTransition();
  const [text, setText] = useState('');
  const router = useRouter();

  function handleAddTwitt() {
    if (!text) return;
    startTransition(async () => {
      const error = await addTwitt({ userId: user.id!, text: text });
      if (error) return alert('something went wrong');

      router.back();
    });
  }

  return (
    <>
      <ModalBody>
        <div className="flex gap-1">
          <Avatar
            src={user.image || '/default_white.jpg'}
            alt={user.name!}
            className="flex-shrink-0 mt-1"
          />
          <Textarea
            variant="bordered"
            size="lg"
            placeholder="What's happening?!"
            classNames={{
              input: "text-xl placeholder:text-darkgray",
              inputWrapper: "border-none",
            }}
            minRows={5}
            maxRows={10}
            value={text}
            onChange={e => setText(e.target.value)}
          />
        </div>
      </ModalBody>
      <ModalFooter className="flex items-center border-t border-t-darkgray justify-between">
        <div className="flex items-center gap-0.5">
          {optionsIcons.map((icon, idx) => (
            <Button key={idx} isIconOnly size="sm" variant="light" radius="full" color="primary">
              {icon}
            </Button>
          ))}
        </div>
        <Button isLoading={isPending} spinner={<LoadingSpinner size="sm" color="#fff" />} onClick={handleAddTwitt} isDisabled={!text.trim() || isPending} size="sm" color="primary" radius="full" className="font-bold text-base">Post</Button>
      </ModalFooter>
    </>
  )
}

export default CreatePost;
