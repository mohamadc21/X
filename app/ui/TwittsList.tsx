"use client";

import React, { useEffect, useState } from "react";
import Twitt from "./Twitt";
import { ITwitt } from "../lib/definitions";
import { Session } from "next-auth";
import LoadingSpinner from "./LoadingSpinner";
import { pusherClient } from "../lib/pusher";

type TwittsListProps = {
  session: Session | null,
  allTwitts: ITwitt[],
  mediaOnly?: boolean
}

function TwittsList({ session, allTwitts, mediaOnly = false }: TwittsListProps) {
  const [twitts, setTwitts] = useState(allTwitts);

  useEffect(() => {
    const twittsChannel = pusherClient.subscribe('twitts');

    twittsChannel.bind('lastTwitt', (data: ITwitt) => {
      setTwitts(prev => [data, ...prev]);
    });

    twittsChannel.bind('views', (data: { id: number | string, user_id: number | string }) => {
      const updatedTwitts = twitts.map(twitt => {
        if (twitt.id === data.id) {
          twitt = {
            ...twitt,
            views: [...twitt.views, data.user_id as number]
          }
        }
        return twitt;
      })
      setTwitts(updatedTwitts);
    })

    twittsChannel.bind('likes', (data: { id: number | string, user_id: number | string, isLiked: boolean }) => {
      setTwitts(() => twitts.map(twitt => {
        if (twitt.id === data.id as number) {
          const hasUserOptimisticallyLiked = twitt.likes.some(like => like == data.user_id);

          if (data.isLiked && !hasUserOptimisticallyLiked) {
            twitt = {
              ...twitt,
              likes: [...twitt.likes, data.user_id]
            }
          } else if (!data.isLiked && hasUserOptimisticallyLiked) {
            twitt = {
              ...twitt,
              likes: twitt.likes.filter(like => like != data.user_id)
            }
          }
        }
        return twitt;
      }))
    });

    return () => {
      twittsChannel.unbind();
    }
  }, [twitts]);

  useEffect(() => {
    setTwitts(allTwitts);
  }, [allTwitts]);
  const groupedTwitts = [];
  for (let i = 0; i < twitts.length; i += 3) {
    groupedTwitts.push(twitts.slice(i, i + 3));
  }

  return (
    <div
      className={`overflow-hidden w-full`}
    >
      {mediaOnly ? (
        <>
          {groupedTwitts?.map((group, idx) => (
            <div key={idx} className="flex gap-1">
              {group.map(twitt => (
                <div className="w-[33.33%]">
                  <Twitt
                    user={session?.user!}
                    key={twitt.id}
                    twitt={twitt}
                    setTwitts={setTwitts}
                    mediaOnly={mediaOnly}
                  />
                </div>
              ))}
            </div>
          ))}
        </>
      ) : (
        <>
          {twitts?.map((twitt, idx) => (
            <Twitt
              user={session?.user!}
              key={twitt.id}
              twitt={twitt}
              setTwitts={setTwitts}
              mediaOnly={mediaOnly}
            />
          ))}
        </>
      )}
    </div>
  )
}

export default TwittsList;
