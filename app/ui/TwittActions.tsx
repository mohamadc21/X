import { ITwitt, SessionUser } from "@/app/lib/definitions";
import { Button } from "@nextui-org/react";
import { FaHeart, FaRegComment, FaRegHeart } from "react-icons/fa";
import { GoBookmark } from "react-icons/go";
import { LuRepeat2 } from "react-icons/lu";
import { MdOutlineFileUpload } from "react-icons/md";
import { SiSimpleanalytics } from "react-icons/si";
const numeral = require('numeral');

type Props = {
  twitt: ITwitt,
  user: SessionUser,
  onCommentsClick?: () => any,
  onRetwitt?: () => any,
  onLike?: () => any,
  className?: string
}

function TwittActions({ twitt, user, onCommentsClick, onRetwitt, onLike, className }: Props) {
  return (
    <div className={`flex items-center gap-4 justify-between ${className}`}>
      <Button onClick={onCommentsClick} variant="bordered" className="flex items-center text-default-400 hover:bg-transparent hover:text-primary border-none group gap-0 transition-all duration-150 min-w-0 px-0">
        <div className="rounded-full py-1.5 px-2 group-hover:bg-primary/20">
          <FaRegComment size={17} className="relative" />
        </div>
        <span className="text-sm -ml-1">{twitt.comments.length}</span>
      </Button>
      <Button variant="bordered" className="flex items-center text-default-400 hover:bg-transparent hover:text-emerald-400 border-none group gap-0 transition-all duration-150 min-w-0 px-0" onClick={onRetwitt}>
        <div className="rounded-full py-1.5 px-2 group-hover:bg-emerald-400/20">
          <LuRepeat2 size={20} />
        </div>
        <span className="text-sm -ml-1">{twitt.retwitts.length}</span>
      </Button>
      <Button type="submit" variant="bordered" className="flex items-center text-default-400 hover:bg-transparent hover:text-pink-600 border-none group gap-0 transition-all duration-150 min-w-0 px-0" onClick={onLike}>
        <div className="rounded-full py-1.5 px-2 group-hover:bg-pink-600/20">
          {twitt.likes.includes(user.id!) ? (
            <FaHeart className="text-rose-500" size={15.5} />
          ) : (
            <FaRegHeart size={15.5} />
          )}
        </div>
        <span className="text-sm -ml-1">{twitt.likes.length}</span>
      </Button>
      <Button variant="bordered" className="flex items-center text-default-400 hover:bg-transparent hover:text-primary border-none group gap-0 transition-all duration-150 min-w-0 px-0">
        <div className="rounded-full py-1.5 px-2 group-hover:bg-primary/20">
          <SiSimpleanalytics size={12} />
        </div>
        <span className="text-sm -ml-1">{numeral(twitt.views.length).format('0a')}</span>
      </Button>
      <div className="flex items-center">
        <Button isIconOnly radius="full" size="sm" variant="bordered" className="flex items-center text-default-400 hover:bg-transparent hover:text-primary border-none group gap-0 transition-all duration-150 min-w-0 px-0">
          <div className="rounded-full py-1.5 px-2 group-hover:bg-primary/20">
            <GoBookmark size={20} />
          </div>
        </Button>
        <Button isIconOnly radius="full" size="sm" variant="bordered" className="flex items-center text-default-400 hover:bg-transparent hover:text-primary border-none group gap-0 transition-all duration-150 min-w-0 px-0">
          <div className="rounded-full py-1.5 px-2 group-hover:bg-primary/20">
            <MdOutlineFileUpload size={20} />
          </div>
        </Button>
      </div>
    </div>
  )
}

export default TwittActions;
