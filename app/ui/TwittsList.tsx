"use client";

import React, { useEffect, useState } from "react";
import Twitt from "./Twitt";
import { ITwitt } from "../lib/definitions";
import { Session } from "next-auth";
import LoadingSpinner from "./LoadingSpinner";
import { pusherClient } from "../lib/pusher";

function TwittsList({ session, allTwitts }: { session: Session, allTwitts: ITwitt[] }) {
  const [twitts, setTwitts] = useState(allTwitts);

  useEffect(() => {
    const myChannel = pusherClient.subscribe('twitts');

    myChannel.bind('lastTwitt', (data: ITwitt) => {
      setTwitts(prev => [data, ...prev]);
    });

    return () => {
      myChannel.unbind();
    }
  }, []);

  return (
    <div className="overflow-hidden w-full">
      {twitts?.map(twitt => (
        <Twitt key={twitt.id} twitt={twitt} />
      ))}
    </div>
  )
}

export default TwittsList;
