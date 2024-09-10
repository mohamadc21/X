import { Avatar, Card, CardHeader } from "@nextui-org/react";
import { format } from "date-fns";
import { ITwitt } from "../lib/definitions";
import Image from "next/image";
import { useState } from "react";

function Twitt({ twitt }: { twitt: ITwitt }) {
  const [imageSize, setSmageSize] = useState({
    width: 1,
    height: 1
  });
  return (
    <div className="border-y border-default bg-transparent px-4 py-3 w-full">
      <div className="grid gap-2" style={{ gridTemplateColumns: '45px 1fr' }}>
        <Image width={45} height={45} className="w-[45px] h-[45px] rounded-full flex-shrink-0" src={twitt.user_profile || '/default_white.jpg'} alt={twitt.name!} />
        <div className="flex flex-col overflow-hidden">
          <div className="flex items-start gap-2">
            <div className="flex gap-1">
              <h3 className="font-bold">{twitt.name}</h3>
              <p className="text-darkgray">@{twitt.username}</p>
            </div>
            <p className="text-darkgray">-</p>
            <p className="text-darkgray">{format(new Date(twitt.created_at).toISOString(), 'MMM d')}</p>
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
              onLoadingComplete={target => {
                setSmageSize({
                  width: target.naturalWidth,
                  height: target.naturalHeight
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
      </div>
    </div>
  )
}

export default Twitt;
