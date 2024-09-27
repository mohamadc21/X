import { increaseTwittView, likeTwitt } from "@/app/lib/actions";
import { ITwitt, SessionUser } from "@/app/lib/definitions";
import { useAppDispatch, useIsVisible } from "@/app/lib/hooks";
import { setReplyTo } from "@/app/lib/slices/appSlice";
import { Button } from "@nextui-org/react";
import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useOptimistic, useRef, useState } from "react";
import { FaHeart, FaRegComment, FaRegHeart } from "react-icons/fa";
import { GoBookmark } from "react-icons/go";
import { LuRepeat2 } from "react-icons/lu";
import { MdOutlineFileUpload } from "react-icons/md";
import { SiSimpleanalytics } from "react-icons/si";
import TwittActions from "./TwittActions";
const numeral = require('numeral');

export const ActionTypes = {
  INCREASE_VIEW: "INCREASE_VIEW",
  LIKE_TWITT: "LIKE_TWITT",
  UNLIKE_TWITT: "UNLIKE_TWITT"
};

type TwittProps = {
  twitt: ITwitt,
  user: SessionUser,
  setTwitts: React.Dispatch<React.SetStateAction<ITwitt[]>>,
  mediaOnly?: boolean,
}

function Twitt({ twitt: initialTwitt, user, setTwitts, mediaOnly }: TwittProps) {
  const [twitt, optimisticDispatch] = useOptimistic<ITwitt, { type: string, payload: any }>(initialTwitt, twittReducer);
  const [imageSize, setSmageSize] = useState({
    width: 1,
    height: 1
  });
  const twittRef = useRef(null);
  const isVisible = useIsVisible(twittRef);
  const router = useRouter();
  const dispatch = useAppDispatch();

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

  function handleTwittClick(e: React.MouseEvent<any>) {
    const targetClassList = (e.target as Element).classList;
    if (targetClassList.contains('to-twitt')) {
      router.push(`/${user.username}/status/${twitt.id}`);
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
    <div
      ref={twittRef}
      className={`${mediaOnly ? '' : 'border-b border-default px-4 py-3'} bg-transparent hover:bg-default/15 transition cursor-pointer to-twitt`}
      onClick={handleTwittClick}
    >
      {mediaOnly ? (
        <Link href={`#`} className="w-full h-full">
          <img src={twitt.media!} className="w-full object-cover aspect-square" alt={twitt.text} />
        </Link>
      ) : (
        <div className="grid gap-4 to-twitt" style={{ gridTemplateColumns: '45px 1fr' }}>
          <Link href={`#`} className="relative w-[45px] h-[45px]">
            <Image fill className="sm:block hidden rounded-full flex-shrink-0 object-cover" src={twitt.user_profile} alt={twitt.name!} />
            <Image fill className="sm:hidden block rounded-full flex-shrink-0 object-cover" src={twitt.user_profile} alt={twitt.name!} />
          </Link>
          <div className="flex flex-col gap-3 sm:ml-0 -ml-[7px] to-twitt">
            <div className="to-twitt">
              <div className="flex items-start gap-4 whitespace-nowrap to-twitt">
                <div className="flex items-center gap-1 truncate overflow-hidden">
                  <Link href={`/${twitt.username}`} className="font-bold max-[400px]:text-[15px] text-foreground">{twitt.name}</Link>
                  <Link href={`/${twitt.username}`} className="text-default-400 overflow-hidden max-[400px]:text-[13px]">@{twitt.username}</Link>
                </div>
                <p className="text-default-400">-</p>
                <p className="text-default-400">{format(new Date(twitt.created_at).toISOString(), 'MMM d')}</p>
              </div>
              {twitt.text && (
                <p
                  className="whitespace-pre-wrap leading-5 break-words to-twitt"
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
                  className="mt-4 rounded-2xl to-twitt"
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
                  className="w-full mt-4 rounded-2xl to-twitt"
                />
              )}
            </div>
            <TwittActions
              twitt={twitt}
              user={user}
              onCommentsClick={() => {
                dispatch(setReplyTo(twitt));
                router.push('/post');
              }}
              onLike={handleTwittLike}
              className="-ml-2 to-twitt"
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default Twitt;
