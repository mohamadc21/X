import { Avatar, Button, Card, CardHeader } from "@nextui-org/react";
import { format } from "date-fns";
import { ITwitt, SessionUser } from "../lib/definitions";
import Image from "next/image";
import React, { useEffect, useOptimistic, useRef, useState } from "react";
import { FaHeart, FaRegComment, FaRegHeart } from "react-icons/fa";
import { LuRepeat2 } from "react-icons/lu";
import { SiSimpleanalytics } from "react-icons/si";
import { GoBookmark } from "react-icons/go";
import { MdOutlineFileUpload } from "react-icons/md";
import { useIsVisible } from "../lib/hooks";
import { increaseTwittView, likeTwitt } from "../lib/actions";
import Link from "next/link";

const ActionTypes = {
  INCREASE_VIEW: "INCREASE_VIEW",
  LIKE_TWITT: "LIKE_TWITT",
  UNLIKE_TWITT: "UNLIKE_TWITT"
};

type TwittProps = {
  twitt: ITwitt,
  user: SessionUser,
  setTwitts: React.Dispatch<React.SetStateAction<ITwitt[]>>,
  mediaOnly?: boolean
}

function Twitt({ twitt: initialTwitt, user, setTwitts, mediaOnly }: TwittProps) {
  const [twitt, optimisticDispatch] = useOptimistic<ITwitt, { type: string, payload: any }>(initialTwitt, twittReducer);
  const [imageSize, setSmageSize] = useState({
    width: 1,
    height: 1
  });
  const twittRef = useRef(null);
  const isVisible = useIsVisible(twittRef);

  async function handleIncreaseView() {
    optimisticDispatch({
      type: ActionTypes.INCREASE_VIEW,
      payload: {
        id: twitt.id,
        user_id: user.id
      }
    });
    await increaseTwittView(twitt.id, user.id!);
  }

  async function handleTwittLike() {
    const likeType = twitt.likes.some(like => like == user.id!) ? ActionTypes.UNLIKE_TWITT : ActionTypes.LIKE_TWITT;
    optimisticDispatch({
      type: likeType,
      payload: {
        id: twitt.id,
        user_id: user.id
      }
    });
    await likeTwitt({ twitt_id: twitt.id, user_id: user.id! });

    setTwitts(state => state.map(state => {
      if (twitt.id === state.id) {
        if (likeType === ActionTypes.LIKE_TWITT) {
          return {
            ...state,
            likes: [...state.likes, user.id!]
          }

        } else if (likeType === ActionTypes.UNLIKE_TWITT) {
          return {
            ...state,
            likes: state.likes.filter(like => like != user.id!)
          }
        }
      }
      return state;
    }));
  }

  function twittReducer(state: ITwitt, action: { type: string, payload: any }) {
    switch (action.type) {
      case ActionTypes.INCREASE_VIEW: {
        return {
          ...state,
          views: [...state.views, action.payload.user_id]
        }
      }
      case ActionTypes.LIKE_TWITT: {
        return {
          ...state,
          likes: [...state.likes, action.payload.user_id]
        }
      }
      case ActionTypes.UNLIKE_TWITT: {
        return {
          ...state,
          likes: state.likes.filter(like => like != action.payload.user_id)
        }
      }
      default: {
        return state;
      }
    }
  }

  useEffect(() => {
    if (!isVisible) return;

    const alreadyViewed = twitt.views.some(view => view == user.id!)

    if (!alreadyViewed) {
      handleIncreaseView();
    }
  }, [isVisible]);

  return (
    <div ref={twittRef} className={`${mediaOnly ? '' : 'border-b border-default px-4 py-3'} bg-transparent`}>
      {mediaOnly ? (
        <div className="w-full h-full">
          <img src={twitt.media!} className="w-full object-cover aspect-square" alt={twitt.text} />
        </div>
      ) : (
        <div className="grid gap-2" style={{ gridTemplateColumns: '45px 1fr' }}>
          <Image width={45} height={45} className="sm:block hidden rounded-full flex-shrink-0 w-[45px] h-[45px]" src={twitt.user_profile || '/default_white.jpg'} alt={twitt.name!} />
          <Image width={37} height={37} className="sm:hidden block rounded-full flex-shrink-0 w-[37px] h-[37px]" src={twitt.user_profile || '/default_white.jpg'} alt={twitt.name!} />
          <div className="flex flex-col gap-3 sm:ml-0 -ml-[7px]">
            <div>
              <div className="flex items-start gap-4 whitespace-nowrap">
                <div className="flex items-center gap-1 truncate overflow-hidden">
                  <Link href={`/${twitt.username}`} className="font-bold max-[400px]:text-[15px] text-foreground">{twitt.name}</Link>
                  <Link href={`/${twitt.username}`} className="text-default-400 overflow-hidden max-[400px]:text-[13px]">@{twitt.username}</Link>
                </div>
                <p className="text-default-400">-</p>
                <p className="text-default-400">{format(new Date(twitt.created_at).toISOString(), 'MMM d')}</p>
              </div>
              {twitt.text && (
                <p
                  className="whitespace-pre-wrap leading-5 break-words"
                  dangerouslySetInnerHTML={{ __html: twitt.text }}
                />
              )}
              {twitt.media && twitt.media_type === 'image' && (
                <Image
                  src={twitt.media}
                  layout="responsive"
                  objectFit="contain"
                  alt="twitt image"
                  priority={true}
                  className="mt-4 rounded-2xl"
                  onLoad={target => {
                    setSmageSize({
                      width: target.currentTarget.naturalWidth,
                      height: target.currentTarget.naturalHeight
                    });
                  }}
                  width={imageSize.width}
                  height={imageSize.height}
                />
              )}
              {twitt.media && twitt.media_type === 'gif' && (
                <img
                  src={twitt.media}
                  alt="twitt image"
                  className="w-full mt-4 rounded-2xl"
                />
              )}
            </div>
            <div className="flex items-center gap-4 justify-between -ml-2">
              <Button variant="bordered" className="flex items-center text-default-400 hover:bg-transparent hover:text-primary border-none group gap-0 transition-all duration-150 min-w-0 px-0">
                <div className="rounded-full py-1.5 px-2 group-hover:bg-primary/20">
                  <FaRegComment size={17} className="relative" />
                </div>
                <span className="text-sm -ml-1">{twitt.comments.length}</span>
              </Button>
              <Button variant="bordered" className="flex items-center text-default-400 hover:bg-transparent hover:text-emerald-400 border-none group gap-0 transition-all duration-150 min-w-0 px-0">
                <div className="rounded-full py-1.5 px-2 group-hover:bg-emerald-400/20">
                  <LuRepeat2 size={20} />
                </div>
                <span className="text-sm -ml-1">{twitt.retwitts.length}</span>
              </Button>
              <form action={handleTwittLike}>
                <Button type="submit" variant="bordered" className="flex items-center text-default-400 hover:bg-transparent hover:text-pink-600 border-none group gap-0 transition-all duration-150 min-w-0 px-0">
                  <div className="rounded-full py-1.5 px-2 group-hover:bg-pink-600/20">
                    {twitt.likes.includes(user.id!) ? (
                      <FaHeart className="text-rose-500" size={15.5} />
                    ) : (
                      <FaRegHeart size={15.5} />
                    )}
                  </div>
                  <span className="text-sm -ml-1">{twitt.likes.length}</span>
                </Button>
              </form>
              <Button variant="bordered" className="flex items-center text-default-400 hover:bg-transparent hover:text-primary border-none group gap-0 transition-all duration-150 min-w-0 px-0">
                <div className="rounded-full py-1.5 px-2 group-hover:bg-primary/20">
                  <SiSimpleanalytics size={12} />
                </div>
                <span className="text-sm -ml-1">{twitt.views.length}</span>
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
          </div>
        </div>
      )}
    </div>
  )
}

export default Twitt;
