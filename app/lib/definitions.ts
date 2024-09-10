import { z } from "zod";

export interface SignupData {
  name: string;
  email: string;
  year: string;
  month: string;
  day: string;
}

export interface VerificationData {
  code: number;
}

export interface PasswordData {
  password: string
}

export interface User {
  id: number,
  userId: number,
  name: string,
  username: string | null,
  email: string,
  password: string,
  profile: string | null,
  birthday: Date,
  verification_code: string | null,
  created_at: Date,
  updated_at: Date
}


export type SessionUser = {
  id?: string
  name?: string | null
  email?: string | null
  image?: string | null
}

export interface AddTwitt {
  userId: string | number,
  text: string,
  formData?: FormData,
  gif?: string,
}

export interface TwittsTable {
  id: number | string,
  userId: string | number,
  text: string,
  media: string | null,
  media_type: 'image' | 'gif' | 'video' | null
  created_at: Date,
  updated_at: Date,
}

export interface ITwitt extends Omit<TwittsTable, 'image'> {
  username: string,
  name: string,
  user_profile: string | null,
}

export interface Verification {
  id: number,
  email: string,
  code: number,
  expires_at: Date
}

export interface ModalProps {
  className?: string | undefined,
  defaultOpen?: boolean | undefined,
  isDismissable?: boolean | undefined,
  centerContent?: boolean,
  classNames?: {
    base?: string | undefined,
    header?: string | undefined,
    backdrop?: string | undefined,
    body?: string | undefined,
    footer?: string | undefined,
    closeButton?: string | undefined
  }
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "full" | undefined;
  radius?: "sm" | "md" | "lg" | "none" | undefined;
  scrollBehavior?: "normal" | "inside" | "outside" | undefined;
  backdrop?: "transparent" | "opaque" | "blur" | undefined;
  isKeyboardDismissDisabled?: boolean | undefined,
  shouldBlockScroll?: boolean
}

export type ActionError = {
  message?: string
} | void;

export const SignupScheme: z.ZodType<SignupData> = z.object({
  name: z.string({
    errorMap: () => ({ message: "What's your name?" })
  }).trim().min(1),
  email: z.string().email({
    message: "Please enter a valid email"
  }),
  year: z.string({
    errorMap: () => ({ message: "Please choose year" })
  }).min(4),
  month: z.string({
    errorMap: () => ({ message: "Please choose month" })
  }).min(1),
  day: z.string({
    errorMap: () => ({ message: "Please choose day" })
  }).min(1),
})

export const VerificationScheme: z.ZodType<VerificationData> = z.object({
  code: z.coerce.number().lte(99999, {
    message: 'Enter the verification code (5 digits)'
  }).gte(10000, {
    message: 'Enter the verification code (5 digits)'
  })
})

export const PasswordScheme: z.ZodType<PasswordData> = z.object({
  password: z.string().min(8, {
    message: "password must be more than 8 characters"
  }),
})