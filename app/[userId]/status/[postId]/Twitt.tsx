"use client";

import { follow, increaseTwittView, likeTwitt, unFollow } from "@/app/lib/actions";
import { ITwitt, SessionUser, UserFollowingsAndFollowers } from "@/app/lib/definitions";
import { useAppDispatch } from "@/app/lib/hooks";
import { setReplyTo } from "@/app/lib/slices/appSlice";
import CreatePost from "@/app/ui/createPost/CreatePost";
import { ActionTypes } from "@/app/ui/Twitt";
import TwittActions from "@/app/ui/TwittActions";
import { Button, Card } from "@nextui-org/react";
import { format } from "date-fns";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
const numeral = require('numeral');

function Twitt({ data, sessionUser }: { data: ITwitt & { follows: UserFollowingsAndFollowers }, sessionUser: SessionUser }) {
  const [twitt, setTwitt] = useState(data);
  const [followingText, setFollowingText] = useState('Following');
  const [imageSize, setSmageSize] = useState({
    width: 1,
    height: 1
  });
  const router = useRouter();
  const dispatch = useAppDispatch();

  async function handleIncreaseView() {
    setTwitt(prev => ({
      ...prev,
      views: [...prev.views, sessionUser.id]
    }));
    await increaseTwittView(twitt.id, sessionUser.id!);
  }

  async function handleTwittLike() {
    const likeType = twitt.likes.some(like => like == sessionUser.id!) ? ActionTypes.UNLIKE_TWITT : ActionTypes.LIKE_TWITT;
    setTwitt(prev => ({
      ...prev,
      likes: likeType === 'LIKE_TWITT' ? [...prev.likes, sessionUser.id] : prev.likes.filter(like => like != sessionUser.id)
    }))
    await likeTwitt({ twitt_id: twitt.id, user_id: sessionUser.id! });
  }

  async function hanldeFollow() {
    await follow(sessionUser?.id!, twitt.id);
  }

  async function hanldeUnfollow() {
    await unFollow(sessionUser?.id!, twitt.id);
  }

  useEffect(() => {
    setTwitt(data);
  }, [data]);

  useEffect(() => {
    dispatch(setReplyTo(twitt));
  }, [twitt]);


  return (
    <div className="flex flex-col gap-3 px-4 border-b border-b-default pb-5">
      <div className="flex items-center justify-between">
        <div className="flex gap-2 items-center">
          <Card isPressable className="h-[45px] w-[45px] min-w-max rounded-full relative" onClick={() => router.push(`/${twitt.username}`)}>
            <Image fill src={twitt.user_profile} className="object-cover" alt={twitt.name} />
          </Card>
          <div>
            <h2 className="font-bold leading-5">{twitt.name}</h2>
            <p className="text-default-400 text-[15px]">@{twitt.username}</p>
          </div>
        </div>
        <div>
          {twitt.user_id !== sessionUser?.id && (
            <>
              {twitt.follows.followers.some(follower => follower == sessionUser?.id! as number) ? (
                <Button variant="bordered" className="font-bold text-base hover:border-danger/75 hover:bg-danger/20 hover:text-danger" radius="full" onPointerEnter={() => setFollowingText("Unfollow")} onPointerLeave={() => setFollowingText("Following")} onClick={hanldeUnfollow}>
                  {followingText}
                </Button>
              ) : (
                <Button onClick={hanldeFollow} color="secondary" className="font-bold text-base" radius="full">
                  Follow
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {twitt.text && (
        <p
          className="whitespace-pre-wrap leading-5 break-words to-twitt text-lg"
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
      {twitt.media && twitt.media_type === 'video' && (
        <video src={twitt.media} width="100%" className="aspect-video"></video>
      )}
      <ul className="flex items-center text-default-400">
        <li>{format(twitt.created_at.toISOString(), 'p')}</li>
        <span className="px-1">-</span>
        <li>{format(twitt.created_at.toISOString(), 'PP')}</li>
        <span className="px-1">-</span>
        <li><span className="text-foreground">{numeral(twitt.views.length).format('0a')}</span> Views</li>
      </ul>
      <TwittActions
        twitt={twitt}
        user={sessionUser}
        onCommentsClick={() => {
          dispatch(setReplyTo(twitt))
          router.push('/post');
        }}
        onLike={handleTwittLike}
        className="border-y border-y-default py-2"
      />
      <div className="mt-2">
        <CreatePost type="reply" noPadding user={sessionUser} rows={1} showOnClick />
      </div>
    </div>
  )
}

export default Twitt;
