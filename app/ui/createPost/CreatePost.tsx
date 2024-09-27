"use client";

import { addTwitt } from "@/app/lib/actions";
import { AddTwitt, SessionUser } from "@/app/lib/definitions";
import LoadingSpinner from "@/app/ui/LoadingSpinner";
import { GiphyFetch, ICategory } from "@giphy/js-fetch-api";
import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Textarea, useDisclosure } from "@nextui-org/react";
import EmojiPicker, { EmojiClickData, EmojiStyle, SkinTonePickerLocation, Theme } from 'emoji-picker-react';
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { ChangeEvent, useEffect, useRef, useState, useTransition } from "react";
import { BsEmojiSmile } from "react-icons/bs";
import { IoClose } from "react-icons/io5";
import { LuImage } from "react-icons/lu";
import { MdGif } from "react-icons/md";
import { useAppSelector, useModalProps } from "@/app/lib/hooks";
import { format } from "date-fns";
import { useSWRConfig } from "swr";
import { MediaPlayer, MediaProvider } from '@vidstack/react';
import { defaultLayoutIcons, DefaultVideoLayout } from '@vidstack/react/player/layouts/default';

type Props = {
  user: SessionUser,
  asModal?: boolean,
  rows?: number,
  noPadding?: boolean,
  type?: 'post' | 'reply',
  showOnClick?: boolean,
}

const options = [
  {
    type: 'uploadImage',
    icon: <LuImage size={19} className="text-primary" />
  },
  {
    type: 'selectGif',
    icon: <MdGif size={19} className="text-primary" />
  },
  // {
  //   type: '',
  //   icon: <CgOptions size={19} className="text-primary" />
  // },
  {
    type: 'pick-emoji',
    icon: <BsEmojiSmile size={19} className="text-primary" />
  },
  // {
  //   type: '',
  //   icon: <RiCalendarScheduleLine size={19} className="text-primary" />
  // },
  // {
  //   type: '',
  //   icon: <IoLocationOutline size={19} className="text-primary" />
  // },
]

function CreatePost({ user, asModal = false, rows = 2, noPadding, type = "post", showOnClick = false }: Props) {
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [text, setText] = useState('');
  const [fullText, setFullText] = useState('');
  const [showFull, setShowFull] = useState(false);
  const [search, setSearch] = useState('');
  const [media, setMedia] = useState<{ upload: File | null, temp: string | null, type: 'video' | 'image' | null }>({
    upload: null,
    temp: null,
    type: null
  });
  const [error, setError] = useState('');
  const [gifs, setGifs] = useState<any[]>([]);
  const [gif, setGif] = useState('');
  const [categories, setCategories] = useState<ICategory[]>([]);
  const gf = new GiphyFetch('ywdLkUP7O8eyz3Q3cndJ1oTmQyOIg15U')
  const { isOpen, onOpenChange, onOpen, onClose } = useDisclosure();
  const [isOpenEmojiPanel, setIsOpenEmojiPanel] = useState(false);
  const modalProps = useModalProps;
  const router = useRouter();
  const { mutate } = useSWRConfig();
  const replyTo = useAppSelector(state => state.app.replyTo);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  function handleAddTwitt() {
    startTransition(async () => {
      const twittData: AddTwitt = {
        userId: user.id!,
        text: fullText,
      }
      if (media.upload) {
        const formData = new FormData();
        formData.append('media', media.upload);
        twittData.formData = formData;
      }
      if (gif) twittData.gif = gif;
      if (replyTo) twittData.replyTo = replyTo.id;
      const error = await addTwitt(twittData);
      if (error) {
        return setError(error.message);
      }
      mutate('/api/twitts');
      mutate('/api/twitts/comments');
      mutate('/api/user/twitts');
      setText('');
      setFullText('');
      setGif('');
      setMedia({ upload: null, temp: null, type: null });
      if (asModal) {
        router.back();
      }
    });
  }

  function handleOptionClick(option: string) {
    if (option === 'uploadImage') {
      fileInputRef.current?.click();
    }
    if (option === 'selectGif') {
      onOpen();
    }
    if (option === 'pick-emoji') {
      setIsOpenEmojiPanel(isOpenEmojiPanel ? false : true);
    }
  }

  async function handleFileUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const tempImage = URL.createObjectURL(file);
    if (gif) setGif('');
    setMedia({ upload: file, temp: tempImage, type: file.type.split('/')[0] === 'video' ? 'video' : 'image' });
  }

  async function fetchGifsBySearch(searchTerm: string) {
    const { data } = await gf.search(searchTerm, { limit: 5 });
    setGifs(data);
  }

  async function handleSelectGif(gifUrl: string) {
    if (media.temp) {
      setMedia({ temp: null, upload: null, type: null });
    }
    setGif(gifUrl);
    onClose();
  }

  async function handleEmojiSelect(emoji: EmojiClickData) {
    setText(prev => prev += emoji.emoji);
    const emojiSrc = emoji.getImageUrl(EmojiStyle.TWITTER);
    setFullText(prev => prev += `<img class="inline-block mx-0.5" src="${emojiSrc}" width="17" alt="${emoji.names[0]}" />`)
  }

  useEffect(() => {
    async function fetchCategories() {
      const { data } = await gf.categories({ limit: 3 });
      setCategories(data);
      console.log(data);
    }

    // fetchCategories();
    return () => {
      setGif('');
      setGifs([]);
      setSearch('');
    }
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (isOpenEmojiPanel && !emojiPickerRef.current?.contains(e.target as Node)) {
        setIsOpenEmojiPanel(false);
      }
    }

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    }
  }, [isOpenEmojiPanel]);

  useEffect(() => {
    setMounted(true);
    if (media.temp) {
      return () => {
        URL.revokeObjectURL(media.temp!);
      }
    }
  }, [media.temp]);

  return (
    <>
      {asModal ? (
        <>
          <ModalBody>
            {replyTo && (
              <div className="grid gap-2 mb-4" style={{ gridTemplateColumns: '45px 1fr' }}>
                <div>
                  <Image width={45} height={45} className="sm:block hidden rounded-full flex-shrink-0 w-[45px] h-[45px]" src={replyTo.user_profile || '/default_white.jpg'} alt={replyTo.name!} />
                  <Image width={37} height={37} className="sm:hidden block rounded-full flex-shrink-0 w-[37px] h-[37px]" src={replyTo.user_profile || '/default_white.jpg'} alt={replyTo.name!} />
                  <div className="h-[60%] w-0.5 bg-default-100 mx-auto" />
                </div>
                <div className="flex flex-col gap-3 sm:ml-0 -ml-[7px]">
                  <div>
                    <div className="flex items-start gap-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 truncate overflow-hidden">
                        <p className="font-bold max-[400px]:text-[15px] text-foreground">{replyTo.name}</p>
                        <p className="text-default-400 overflow-hidden max-[400px]:text-[13px]">@{replyTo.username}</p>
                      </div>
                      <p className="text-default-400">-</p>
                      <p className="text-default-400">{format(new Date(replyTo.created_at).toISOString(), 'MMM d')}</p>
                    </div>
                    {replyTo.text && (
                      <p
                        className="whitespace-pre-wrap leading-5 break-words"
                        dangerouslySetInnerHTML={{ __html: replyTo.text }}
                      />
                    )}
                    <div className="mt-4 text-default-400">
                      <p>Replying to <span className="text-primary">@{replyTo.username}</span></p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div className="flex gap-1">
              <Image
                width={44}
                height={44}
                priority={true}
                src={user.image}
                alt={user.name}
                className="flex-shrink-0 w-11 h-11 rounded-full object-cover"
              />
              <div className="w-full relative">
                <div className="relative">
                  <Textarea
                    variant="bordered"
                    size="lg"
                    placeholder={`${replyTo ? 'Post your reply' : 'What\'s happening?!'}`}
                    classNames={{
                      input: "text-xl max-[380px]:text-lg placeholder:text-default-400",
                      inputWrapper: "border-none",
                    }}
                    value={text}
                    onChange={(e) => {
                      setText(e.target.value);
                      setFullText(e.target.value);
                    }}
                    minRows={rows}
                    maxRows={12}
                  />
                </div>
                {media.temp && (
                  <div className="relative">
                    <div className="relative">
                      {media.type === 'video' ? (
                        <video src={media.temp} width="100%" className="rounded-2xl max-h-[600px]" controls></video>
                      ) : (
                        <img className="w-full h-full rounded-2xl object-cover" src={media.temp} alt={`${user.name}s post image`} />
                      )}
                    </div>
                    <Button variant="faded" isIconOnly size="sm" radius="full" className="absolute top-2 right-2 " onClick={() => setMedia({ upload: null, temp: null, type: null })}>
                      <IoClose size="20" />
                    </Button>
                    <Button variant="faded" onClick={() => handleOptionClick('uploadImage')} size="sm" className=" absolute top-2 left-2 text-base" radius="full">Edit</Button>
                  </div>
                )}
                {gif && (
                  <div className="relative">
                    <img className="w-full h-full rounded-2xl" src={gif} />
                    <Button variant="faded" isIconOnly size="sm" radius="full" className="absolute top-2 right-2 " onClick={() => setGif('')}>
                      <IoClose size="20" />
                    </Button>
                  </div>
                )}
                {mounted && (
                  <div className="fixed z-50" ref={emojiPickerRef}>
                    <EmojiPicker
                      autoFocusSearch={true}
                      open={isOpenEmojiPanel}
                      theme={Theme.DARK}
                      emojiStyle={EmojiStyle.TWITTER}
                      width={350}
                      height={400}
                      className="!bg-background z-30"
                      skinTonePickerLocation={SkinTonePickerLocation.PREVIEW}
                      onEmojiClick={handleEmojiSelect}
                      style={{ "--epr-emoji-size": "20px", "--epr-bg-color": "bg-background", "--epr-category-label-bg-color": "bg-background" } as React.CSSProperties}
                    />
                  </div>

                )}
              </div>
            </div>
          </ModalBody>
          <ModalFooter className="flex items-center justify-between py-3 sticky bottom-0 left-0 w-full gap-3">
            <div className="flex items-center gap-0.5">
              {options.map((opt, idx) => (
                <Button onClick={() => handleOptionClick(opt.type)} key={idx} isIconOnly size="sm" variant="light" radius="full" color="primary" isDisabled={!opt.type}>
                  {opt.icon}
                </Button>
              ))}
            </div>
            <Button isLoading={isPending} spinner={<LoadingSpinner size="sm" color="#fff" />} onClick={handleAddTwitt} isDisabled={(!text.trim() || isPending) && !media.upload && !gif} size="sm" color="primary" radius="full" className="font-bold ml-auto text-base">{replyTo ? 'Reply' : 'Post'}</Button>

          </ModalFooter>
        </>
      ) : (
        <div className={noPadding ? '' : 'px-4'}>
          <div className="flex gap-1">
            <div className="relative w-[44px] h-[44px] flex-shrink-0">
              <Image
                fill
                priority={true}
                src={user.image}
                alt={user.name}
                className="w-[44px] h-[44px] rounded-full object-cover"
              />
            </div>
            <div className="w-full relative">
              <div className="flex items-center justify-between">
                <Textarea
                  variant="bordered"
                  size="lg"
                  placeholder={(type === 'reply' || replyTo) ? 'Post your reply' : 'What\'s happening?!'}
                  classNames={{
                    input: "text-xl max-[380px]:text-lg placeholder:text-default-400",
                    inputWrapper: "border-none",
                  }}
                  value={text}
                  onChange={(e) => {
                    setText(e.target.value);
                    setFullText(e.target.value);
                  }}
                  minRows={rows}
                  maxRows={50}
                  onClick={() => {
                    showOnClick ? setShowFull(true) : null
                  }}
                />
                {(showOnClick && !showFull) && (
                  <Button isDisabled size="sm" color="primary" radius="full" className="font-bold ml-auto text-base">Reply</Button>
                )}
              </div>
              {media.temp && (
                <div className="relative">
                  {media.type === 'video' ? (
                    <video src={media.temp} width="100%" className="rounded-2xl max-h-[600px]" controls></video>
                  ) : (
                    <img className="w-full h-full rounded-2xl object-cover" src={media.temp} alt={`${user.name}s post image`} />
                  )}
                  <Button variant="faded" isIconOnly size="sm" radius="full" className="absolute top-2 right-2 " onClick={() => setMedia({ upload: null, temp: null, type: null })}>
                    <IoClose size="20" />
                  </Button>
                  <Button variant="faded" onClick={() => handleOptionClick('uploadImage')} size="sm" className=" absolute top-2 left-2 text-base" radius="full">Edit</Button>
                </div>
              )}
              {gif && (
                <div className="relative">
                  <img className="w-full h-full rounded-2xl" src={gif} />
                  <Button variant="faded" isIconOnly size="sm" radius="full" className="absolute top-2 right-2 " onClick={() => setGif('')}>
                    <IoClose size="20" />
                  </Button>
                </div>
              )}
              {(!showOnClick || (showOnClick && showFull)) && (
                <div className={`flex items-center justify-between sticky bottom-0 left-0 w-full gap-3 bg-background ${showOnClick && showFull ? 'pt-3' : 'py-3'}`}>
                  <div className="flex max-[400px]:-ml-12 items-center gap-0.5">
                    {options.map((opt, idx) => (
                      <Button onClick={() => handleOptionClick(opt.type)} key={idx} isIconOnly size="sm" variant="light" radius="full" color="primary" isDisabled={!opt.type}>
                        {opt.icon}
                      </Button>
                    ))}
                  </div>
                  <Button isLoading={isPending} spinner={<LoadingSpinner size="sm" color="#fff" />} onClick={handleAddTwitt} isDisabled={(!text.trim() || isPending) && !media.upload && !gif} size="sm" color="primary" radius="full" className="font-bold ml-auto text-base">{(type === 'reply' || replyTo) ? 'Reply' : 'Post'}</Button>
                </div>
              )}
              {mounted && (
                <div className="absolute top-full" ref={emojiPickerRef}>
                  <EmojiPicker
                    autoFocusSearch={true}
                    open={isOpenEmojiPanel}
                    theme={Theme.DARK}
                    emojiStyle={EmojiStyle.TWITTER}
                    width={350}
                    height={400}
                    className="!bg-background z-30"
                    skinTonePickerLocation={SkinTonePickerLocation.PREVIEW}
                    onEmojiClick={handleEmojiSelect}
                    style={{ "--epr-emoji-size": "20px", "--epr-bg-color": "bg-background", "--epr-category-label-bg-color": "bg-background" } as React.CSSProperties}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <input
        type="file"
        accept="image/*, video/*"
        ref={fileInputRef}
        onChange={handleFileUpload}
        hidden
      />
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement="top"
        {...modalProps({ size: "xl" })}
      >
        <ModalContent>
          <ModalHeader />
          <ModalBody>
            <form onSubmit={(e) => {
              e.preventDefault();
              if (!search) return;
              fetchGifsBySearch(search);
            }}
              className="max-w-sm"
            >
              <Input
                variant="bordered"
                type="search"
                size="lg"
                placeholder="Search for gifs"
                color="primary"
                classNames={{
                  label: 'text-default-400 text-lg'
                }}
                onChange={(e) => setSearch(e.target.value)}
                value={search}
                radius="full"
                className="w-full"
              />
            </form>
            <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
              {gifs && (
                gifs.map(gif => (
                  <button key={gif.id} onClick={() => handleSelectGif(gif.images.original.url)}>
                    <img src={gif.images.original.url} className="object-contain" alt="gif" />
                  </button>
                ))
              )}
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}

export default CreatePost;
