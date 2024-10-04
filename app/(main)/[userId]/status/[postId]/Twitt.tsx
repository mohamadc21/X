"use client";

import React, { Key, useTransition } from "react";
import {
  deleteTwitt,
  follow,
  increaseTwittView,
  likeTwitt,
  unFollow,
} from "@/app/_lib/actions";
import {
  ITwitt,
  SessionUser,
  UserFollowingsAndFollowers,
} from "@/app/_lib/definitions";
import CreatePost from "@/app/_ui/createPost/CreatePost";
import { ActionTypes } from "@/app/_ui/Twitt";
import TwittActions from "@/app/_ui/TwittActions";
import { Button } from "@nextui-org/react";
import { MediaPlayer, MediaProvider } from "@vidstack/react";
import {
  defaultLayoutIcons,
  DefaultVideoLayout,
} from "@vidstack/react/player/layouts/default";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import TwittSettings from "@/app/_ui/TwittSettings";
import useSWR, { useSWRConfig } from "swr";
import DeleteConfirm from "@/app/_ui/DeleteConfirm";
import Alert from "@/app/_ui/Alert";
import Link from "next/link";
import { optimizedText } from "@/app/_utils/optimizedText";

const numeral = require("numeral");

function Twitt({
  data,
  sessionUser,
}: {
  data: ITwitt & { follows: UserFollowingsAndFollowers };
  sessionUser: SessionUser;
}) {
  const [twitt, setTwitt] = useState(data);
  const [followingText, setFollowingText] = useState("Following");
  const [imageSize, setSmageSize] = useState({
    width: 1,
    height: 1,
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const { mutate } = useSWRConfig();
  useSWR(
    `/api/twitt`,
    async () => {
      const resp = await fetch(`/api/twitts/${twitt.id}`);
      const data = await resp.json();
      if (data) {
        setTwitt(data);
      }
    },
    {
      refreshInterval: 5000,
    }
  );

  async function handleIncreaseView() {
    setTwitt((prev) => ({
      ...prev,
      views: [...prev.views, sessionUser.id],
    }));
    await increaseTwittView(twitt.id, sessionUser.id!);
  }

  async function handleTwittLike() {
    const likeType = twitt.likes.some((like) => like == sessionUser.id!)
      ? ActionTypes.UNLIKE_TWITT
      : ActionTypes.LIKE_TWITT;
    setTwitt((prev) => ({
      ...prev,
      likes:
        likeType === "LIKE_TWITT"
          ? [...prev.likes, sessionUser.id]
          : prev.likes.filter((like) => like != sessionUser.id),
    }));
    await likeTwitt({ twitt_id: twitt.id, user_id: sessionUser.id! });
  }

  async function hanldeFollow() {
    await follow(sessionUser?.id!, twitt.id);
  }

  async function hanldeUnfollow() {
    await unFollow(sessionUser?.id!, twitt.id);
  }

  async function handleMenuAction(key: Key) {
    setMessage("");
    if (key === "delete") {
      setShowDeleteConfirm(true);
    } else if (key === "follow") {
      await follow(sessionUser.id, twitt.user_id);
      setMessage(`You're now following @${twitt.username}`);
    } else {
      setMessage("This option is not available for now.");
    }
  }

  async function handleTwittDelete() {
    startTransition(async () => {
      await deleteTwitt(twitt.id);
      router.replace("/home");
    });
  }

  useEffect(() => {
    setTwitt(data);
  }, [data]);

  useEffect(() => {
    if (!twitt.views.includes(sessionUser.id as number)) {
      handleIncreaseView();
    }
  }, []);

  return (
    <>
      <div className="flex flex-col gap-3 px-4 border-b border-b-default pb-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-between w-full">
            <div className="flex gap-2 items-center">
              <Link href={`/${twitt.username}`} className="w-[45px] h-[45px]">
                <img
                  className="w-[45px] h-[45px] rounded-full flex-shrink-0 object-cover"
                  src={twitt.user_profile}
                  alt={twitt.name!}
                />
              </Link>
              <div>
                <Link href={`/${twitt.username}`} className="font-bold leading-5 block text-foreground">{twitt.name}</Link>
                <Link href={`/${twitt.username}`} className="text-default-400 text-[15px] block">
                  @{twitt.username}
                </Link>
              </div>
            </div>
            <TwittSettings
              twitt={twitt}
              user={sessionUser}
              onMenuAction={handleMenuAction}
            />
          </div>
          <div>
            {twitt.user_id !== sessionUser?.id && (
              <>
                {twitt.follows.followers.some(
                  (follower) => follower == (sessionUser?.id! as number)
                ) ? (
                  <Button
                    variant="bordered"
                    className="font-bold text-base hover:border-danger/75 hover:bg-danger/20 hover:text-danger"
                    radius="full"
                    onPointerEnter={() => setFollowingText("Unfollow")}
                    onPointerLeave={() => setFollowingText("Following")}
                    onClick={hanldeUnfollow}
                  >
                    {followingText}
                  </Button>
                ) : (
                  <Button
                    onClick={hanldeFollow}
                    color="secondary"
                    className="font-bold text-base"
                    radius="full"
                  >
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
            dir={/[\u0600-\u06FF]/.test(twitt.text) ? "rtl" : "ltr"}
            dangerouslySetInnerHTML={{ __html: optimizedText(twitt.text) }}
          />
        )}
        {twitt.media && ["image", "gif"].includes(twitt.media_type ?? "") && (
          <img
            src={twitt.media}
            alt="twitt image"
            className="mt-4 rounded-2xl to-twitt object-cover border border-default"
            onLoad={(target) => {
              setSmageSize({
                width: target.currentTarget.naturalWidth,
                height: target.currentTarget.naturalHeight,
              });
            }}
            width={imageSize.width}
            height={imageSize.height}
          />
        )}
        {twitt.media && twitt.media_type === "video" && (
          <MediaPlayer src={twitt.media} className="mt-4 border border-default">
            <MediaProvider />
            <DefaultVideoLayout icons={defaultLayoutIcons} />
          </MediaPlayer>
        )}
        <ul className="flex items-center text-default-400">
          <li>{format(twitt.created_at, "p")}</li>
          <span className="px-1">-</span>
          <li>{format(twitt.created_at, "PP")}</li>
          <span className="px-1">-</span>
          <li>
            <span className="text-foreground">
              {numeral(twitt.views.length).format("0a")}
            </span>{" "}
            Views
          </li>
        </ul>
        <TwittActions
          twitt={twitt}
          user={sessionUser}
          onCommentsClick={() => {
            router.push(`/post?replyto=${twitt.id}`);
          }}
          onLike={handleTwittLike}
          className="border-y border-y-default py-2"
        />
        <div className="mt-2">
          <CreatePost
            type="reply"
            noPadding
            user={sessionUser}
            rows={1}
            showOnClick
            initialReplyTo={twitt}
          />
        </div>
        {message && <Alert type="fixed">{message}</Alert>}
      </div>
      {showDeleteConfirm && (
        <DeleteConfirm
          desc="This can’t be undone and it will be removed from your profile, the timeline of any accounts that follow you, and from search results. "
          action={handleTwittDelete}
          pending={pending}
        >
          Delete Post?
        </DeleteConfirm>
      )}
    </>
  );
}

export default Twitt;
