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
import { follow, unFollow } from "@/app/lib/actions";
import { ITwitt, SessionUser, User, UserFollowingsAndFollowers } from "@/app/lib/definitions";
import { useAppDispatch } from "@/app/lib/hooks";
import { FaLocationDot } from "react-icons/fa6";
import { setUserData } from "@/app/lib/slices/userSlice";
import { GrAttachment } from "react-icons/gr";
import useSWR from "swr";

type Props = {
  children: React.ReactNode,
  user: User & { twitts: ITwitt[] },
  headerSubtitle: string,
  follows: UserFollowingsAndFollowers,
  sessionUser?: SessionUser
};

function UserProfile({ children, user, headerSubtitle, follows, sessionUser }: Props) {
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
  useSWR<User & { follows: UserFollowingsAndFollowers }>(`/api/user/details`, async () => {
    const resp = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/user/details?id=${user.id}`);
    const data = await resp.json();
    setProfileDetails(data);
    return data;
  }, {
    refreshInterval: 10000
  });

  async function hanldeFollow() {
    setProfileDetails(prev => ({ ...prev, follows: { ...follows, followers: [...prev.follows.followers, sessionUser?.id! as unknown as number] } }));
    await follow(sessionUser?.id!, user.id);
  }

  async function hanldeUnfollow() {
    setProfileDetails(prev => ({ ...prev, follows: { ...follows, followers: prev.follows.followers.filter(follower => follower != sessionUser?.id) } }));
    await unFollow(sessionUser?.id!, user.id);
  }

  useEffect(() => {
    setProfileDetails({ ...user, follows });
    dispatch(setUserData({
      ...user,
      created_at: user.created_at as string,
      updated_at: user.updated_at as string,
      twitts: user.twitts
    }));
  }, [user, follows]);

  useEffect(() => {
    if (pathname === `/${profileDetails.username}`) setCurrentTab('posts');
    if (pathname === `/${profileDetails.username}/with_replies`) setCurrentTab('replies');
    if (pathname === `/${profileDetails.username}/media`) setCurrentTab('media');
  }, [pathname, currentTab]);

  return (
    <div className="sm:border-x border-x-default flex-1 lg:max-w-full max-w-[600px] min-h-[100dvh]">
      <header className="sticky top-0 left-0 w-full bg-background/40 backdrop-blur-sm flex items-center gap-4 px-2 py-1.5 z-[3]">
        <Button variant="light" className="text-lg" radius="full" isIconOnly onClick={() => router.back()}>
          <ArrowLeftOutlined />
        </Button>
        <div>
          <h2 className="text-xl leading-5 font-bold">{profileDetails.name}</h2>
          <p className="text-default-400 text-sm">{headerSubtitle}</p>
        </div>
      </header>
      <div>
        {profileDetails.header_photo ? (
          <Card radius="none" isPressable onClick={() => router.push(`/${profileDetails.username}/header_photo`)} className="w-full h-[200px] relative">
            <Image fill objectFit="cover" priority={true} src={profileDetails.header_photo!} alt={profileDetails.name} />
          </Card>
        ) : (
          <div className="h-[200px] bg-default-200" />
        )}
        <div className="px-4 flex justify-between mb-3">
          <div className="flex flex-col -mt-[12%] gap-3">
            <Card isPressable className="h-[140px] w-[140px] min-w-max rounded-full border-4 border-background relative" onClick={() => router.push(`/${profileDetails.username}/photo`)}>
              <Image fill src={profileDetails.profile || '/default_white.jpg'} className="object-cover" alt={profileDetails.name} />
            </Card>
            <div>
              <h1 className="text-xl font-bold">{profileDetails.name}</h1>
              <p className="text-default-400">@{profileDetails.username}</p>
            </div>
            {profileDetails.bio && (
              <p>{profileDetails.bio}</p>
            )}
            <div className="flex items-center gap-4 flex-wrap">
              {profileDetails.location && (
                <div className="flex items-center gap-1 text-default-400">
                  <FaLocationDot size={15} />
                  <span>{profileDetails.location}</span>
                </div>
              )}
              {profileDetails.website && (
                <div className="flex items-center gap-1 text-default-400">
                  <GrAttachment size={15} />
                  <Link href={profileDetails.website}>{profileDetails.website}</Link>
                </div>
              )}
              <div className="flex items-center gap-1 text-default-400">
                <FaRegCalendarAlt size={15} />
                <span>Joined {format(profileDetails.created_at, "MMMM yyyy")}</span>
              </div>
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
              <Button variant="bordered" className="font-bold text-base" radius="full" onClick={() => router.push(`/${profileDetails.username}/settings/profile`)}>
                Edit Profile
              </Button>
            ) : (
              <>
                {profileDetails.follows.followers.some(follower => follower == sessionUser?.id! as number) ? (
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
