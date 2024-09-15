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
import { useModalProps } from "../lib/utils";

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

function CreatePost({ user, asModal = false }: { user: SessionUser, asModal?: boolean }) {
  const [mounted, setMounted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [text, setText] = useState('');
  const [fullText, setFullText] = useState('');
  const [search, setSearch] = useState('');
  const [image, setImage] = useState<{ upload: File | null, temp: string | null }>({
    upload: null,
    temp: null
  });
  const [gifs, setGifs] = useState<any[]>([]);
  const [gif, setGif] = useState('');
  const [categories, setCategories] = useState<ICategory[]>([]);
  const gf = new GiphyFetch('ywdLkUP7O8eyz3Q3cndJ1oTmQyOIg15U')
  const { isOpen, onOpenChange, onOpen, onClose } = useDisclosure();
  const [isOpenEmojiPanel, setIsOpenEmojiPanel] = useState(false);
  const modalProps = useModalProps;
  const router = useRouter();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const emojiPickerRef = useRef<HTMLDivElement>(null);

  function handleAddTwitt() {
    startTransition(async () => {
      const twittData: AddTwitt = {
        userId: user.id!,
        text: fullText,
      }
      if (image.upload) {
        const formData = new FormData();
        formData.append('image', image.upload);
        twittData.formData = formData;
      }
      if (gif) twittData.gif = gif;
      await addTwitt(twittData);
      setText('');
      setFullText('');
      setGif('');
      setImage({ upload: null, temp: null });
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
    setImage({ upload: file, temp: tempImage });
  }

  async function fetchGifsBySearch(searchTerm: string) {
    const { data } = await gf.search(searchTerm, { limit: 5 });
    setGifs(data);
  }

  async function handleSelectGif(gifUrl: string) {
    if (image.temp) {
      setImage({ temp: null, upload: null });
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
    if (image.temp) {
      return () => {
        URL.revokeObjectURL(image.temp!);
      }
    }
  }, [image.temp]);

  return (
    <>
      {asModal ? (
        <>
          <ModalBody>
            <div className="flex gap-1">
              <Image
                width={44}
                height={44}
                priority={true}
                src={user?.image || '/default_white.jpg'}
                alt={user.name!}
                className="flex-shrink-0 w-11 h-11 rounded-full"
              />
              <div className="w-full relative">
                <div className="relative">
                  <Textarea
                    variant="bordered"
                    size="lg"
                    placeholder="What&apos;s happening?!"
                    classNames={{
                      input: "text-xl max-[380px]:text-lg placeholder:text-default-400",
                      inputWrapper: "border-none",
                    }}
                    value={text}
                    onChange={(e) => {
                      setText(e.target.value);
                      setFullText(e.target.value);
                    }}
                    minRows={2}
                    maxRows={12}
                  />
                </div>
                {image.temp && (
                  <div className="relative">
                    <img className="w-full h-full rounded-2xl" src={image.temp} />
                    <Button variant="faded" isIconOnly size="sm" radius="full" className="absolute top-2 right-2 " onClick={() => setImage({ upload: null, temp: null })}>
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
            <div className="flex max-[400px]:-ml-12 items-center gap-0.5">
              {options.map((opt, idx) => (
                <Button onClick={() => handleOptionClick(opt.type)} key={idx} isIconOnly size="sm" variant="light" radius="full" color="primary" isDisabled={!opt.type}>
                  {opt.icon}
                </Button>
              ))}
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileUpload}
                hidden
              />
            </div>
            <Button isLoading={isPending} spinner={<LoadingSpinner size="sm" color="#fff" />} onClick={handleAddTwitt} isDisabled={(!text.trim() || isPending) && !image.upload && !gif} size="sm" color="primary" radius="full" className="font-bold ml-auto text-base">Post</Button>

          </ModalFooter>
        </>
      ) : (
        <div className="px-4">
          <div className="flex gap-1">
            <Image
              width={44}
              height={44}
              priority={true}
              src={user?.image || '/default_white.jpg'}
              alt={user.name!}
              className="flex-shrink-0 w-11 h-11 rounded-full"
            />
            <div className="w-full relative">
              <div className="relative">
                <Textarea
                  variant="bordered"
                  size="lg"
                  placeholder="What&apos;s happening?!"
                  classNames={{
                    input: "text-xl max-[380px]:text-lg placeholder:text-default-400",
                    inputWrapper: "border-none",
                  }}
                  value={text}
                  onChange={(e) => {
                    setText(e.target.value);
                    setFullText(e.target.value);
                  }}
                  minRows={2}
                  maxRows={50}
                />
              </div>
              {image.temp && (
                <div className="relative">
                  <img className="w-full h-full rounded-2xl" src={image.temp} />
                  <Button variant="faded" isIconOnly size="sm" radius="full" className="absolute top-2 right-2 " onClick={() => setImage({ upload: null, temp: null })}>
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

              <div className="flex items-center justify-between py-3 sticky bottom-0 left-0 w-full gap-3">
                <div className="flex max-[400px]:-ml-12 items-center gap-0.5">
                  {options.map((opt, idx) => (
                    <Button onClick={() => handleOptionClick(opt.type)} key={idx} isIconOnly size="sm" variant="light" radius="full" color="primary" isDisabled={!opt.type}>
                      {opt.icon}
                    </Button>
                  ))}
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    hidden
                  />
                </div>
                <Button isLoading={isPending} spinner={<LoadingSpinner size="sm" color="#fff" />} onClick={handleAddTwitt} isDisabled={(!text.trim() || isPending) && !image.upload && !gif} size="sm" color="primary" radius="full" className="font-bold ml-auto text-base">Post</Button>

              </div>
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
                //                 <Grid
                //                   width={800}
                //                   columns={3}
                //                   fetchGifs={gifs}
                //                   noLink
                //                   onGifClick={(e) => console.log(e)}
                //                 />
              )}
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}

export default CreatePost;
