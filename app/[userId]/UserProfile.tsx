"use client";

import { ArrowLeftOutlined } from "@ant-design/icons";
import { Button } from "@nextui-org/button";
import { Card, Tab, Tabs } from "@nextui-org/react";
import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { FaRegCalendarAlt } from "react-icons/fa";
import { follow, unFollow } from "../lib/actions";
import { SessionUser, User, UserFollowingsAndFollowers } from "../lib/definitions";
import { useAppDispatch } from "../lib/hooks";
import { pusherClient } from "../lib/pusher";
import { setInfo } from "../lib/slices/userSlice";

function UserProfile({ children, user, headerSubtitle, follows, sessionUser }: { children: React.ReactNode, user: User, headerSubtitle: string, follows: UserFollowingsAndFollowers, sessionUser?: SessionUser }) {
  const [profileDetails, setProfileDetails] = useState({ ...user, follows });
  const [followingText, setFollowingText] = useState('Following');
  const router = useRouter();
  const pathname = usePathname();
  const [currentTab, setCurrentTab] = useState(() => {
    if (pathname === `/${user.username}`) return 'posts';
    if (pathname === `/${user.username}/with_replies`) return 'replies';
    if (pathname === `/${user.username}/media`) return 'media';
  });
  const dispatch = useAppDispatch();

  async function handleLike() {
    setProfileDetails(prev => ({ ...prev, follows: { ...follows, followers: [...prev.follows.followers, sessionUser?.id! as unknown as number] } }));
    await follow(sessionUser?.id!, user.id);
  }

  async function handleUnlike() {
    setProfileDetails(prev => ({ ...prev, follows: { ...follows, followers: prev.follows.followers.filter(follower => follower != sessionUser?.id) } }));
    await unFollow(sessionUser?.id!, user.id);
  }

  useEffect(() => {
    const profileChannel = pusherClient.subscribe('profile');
    profileChannel.bind('follows', (data: { follows: UserFollowingsAndFollowers }) => {
      if (profileDetails.follows.followers.length === follows.followers.length) return;
      setProfileDetails(prev => ({ ...prev, follows: data.follows }));
    });

    dispatch(setInfo({
      ...user,
      created_at: user.created_at as string,
      updated_at: user.updated_at as string,
    }));

    return () => {
      profileChannel.unbind();
    }
  }, []);

  useEffect(() => {
    setProfileDetails({ ...user, follows })
  }, [user, follows]);

  useEffect(() => {
    if (pathname === `/${user.username}`) setCurrentTab('posts');
    if (pathname === `/${user.username}/with_replies`) setCurrentTab('replies');
    if (pathname === `/${user.username}/media`) setCurrentTab('media');
  }, [pathname, currentTab]);

  return (
    <div className="sm:border-x border-x-default flex-1 lg:max-w-full max-w-[600px] min-h-[200dvh]">
      <header className="sticky top-0 left-0 w-full bg-background/60 backdrop-blur flex items-center gap-4 px-2 py-1.5 z-[3]">
        <Button variant="light" className="text-lg" radius="full" isIconOnly onClick={() => router.back()}>
          <ArrowLeftOutlined />
        </Button>
        <div>
          <h2 className="text-xl leading-5 font-bold">{profileDetails.name}</h2>
          <p className="text-default-400 text-sm">{headerSubtitle}</p>
        </div>
      </header>
      <div>
        {user.header_photo ? (
          <Card radius="none" isPressable onClick={() => router.push(`/${profileDetails.username}/header_photo`)} className="w-full h-[200px] relative">
            <Image fill objectFit="cover" priority={true} src={profileDetails.header_photo!} alt={profileDetails.name} />
          </Card>
        ) : (
          <div className="h-[200px] bg-default-200" />
        )}
        <div className="px-4 flex justify-between mb-3">
          <div className="flex flex-col gap-3">
            <Card isPressable className="h-[140px] w-[140px] min-w-max rounded-full border-4 border-background -mt-[28%]" onClick={() => router.push(`/${user.username}/photo`)}>
              <Image width={140} priority={true} height={140} src={profileDetails.profile || '/default_white.jpg'} alt={profileDetails.name} />
            </Card>
            <div>
              <h1 className="text-xl font-bold">{profileDetails.name}</h1>
              <p className="text-default-400">@{profileDetails.username}</p>
            </div>
            {profileDetails.bio && (
              <p>{profileDetails.bio}</p>
            )}
            <div className="flex items-center gap-2 text-default-400">
              <FaRegCalendarAlt size={15} />
              <span>Joined {format(profileDetails.created_at, "MMMM yyyy")}</span>
            </div>
            <div className="flex items-center gap-4">
              <p className="text-default-400"><span className="text-foreground">{profileDetails.follows.followings.length}</span> Following</p>
              <p className="text-default-400"><span className="text-foreground">{profileDetails.follows.followers.length}</span> Followers</p>
            </div>
            {sessionUser?.id != profileDetails.id && (
              <p className="text-sm text-default-400">Not followed by anyone you&apos;re following</p>
            )}
          </div>
          <div className="mt-3">
            {profileDetails.id == sessionUser?.id! as number ? (
              <Button variant="bordered" className="font-bold text-base" radius="full" onClick={() => router.push(`/${user.username}/settings/profile`)}>
                Edit Profile
              </Button>
            ) : (
              <>
                {profileDetails.follows.followers.some(follower => follower == sessionUser?.id! as number) ? (
                  <Button variant="bordered" className="font-bold text-base hover:border-danger/75 hover:bg-danger/20 hover:text-danger" radius="full" onPointerEnter={() => setFollowingText("Unfollow")} onPointerLeave={() => setFollowingText("Following")} onClick={handleUnlike}>
                    {followingText}
                  </Button>
                ) : (
                  <Button onClick={handleLike} color="secondary" className="font-bold text-base" radius="full">
                    Follow
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
        <Tabs
          size="lg"
          className="w-full"
          variant="underlined"
          color="primary"
          selectedKey={currentTab}
          classNames={{
            tabList: "w-full gap-0",
            tab: "data-[hover-unselected=true]:hover:bg-default-50 data-[hover-unselected=true]:opacity-100 h-14",
            tabContent: "group-data-[selected=true]:font-bold"
          }}
        >
          <Tab as={Link} className="hover:no-underline" key="posts" href={`/${profileDetails.username}`} title="Posts" />
          <Tab as={Link} className="hover:no-underline" key="replies" href={`/${profileDetails.username}/with_replies`} title="Replies" />
          <Tab as={Link} className="hover:no-underline" key="media" href={`/${profileDetails.username}/media`} title="Media" />
        </Tabs>
        {children}
      </div>
    </div>
  )
}

export default UserProfile;
