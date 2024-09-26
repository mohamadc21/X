import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ITwitt, SignupData, User, UserFollowingsAndFollowers } from "../definitions";

export type SignupSlice = {
  data: SignupData | null,
  step: 1 | 2 | 3 | 4 | 5 | 6,
}

export type LoginSlice = {
  email_username: string | null,
  step: 1 | 2
}

export interface UserSlice {
  info: User & { follows?: UserFollowingsAndFollowers, created_at: string, updated_at: string } | null
  twitts: ITwitt[] | null
}

interface UserState {
  signup: SignupSlice
  login: LoginSlice,
  user: UserSlice,
  replyTo: ITwitt | null
}

const initialState: UserState = {
  signup: {
    data: null,
    step: 1
  },
  login: {
    email_username: null,
    step: 1
  },
  user: {
    info: null,
    twitts: null
  },
  replyTo: null
}

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setSignupData(state, action: PayloadAction<SignupSlice>) {
      state.signup = action.payload;
    },
    setLoginData(state, action: PayloadAction<LoginSlice>) {
      state.login = action.payload;
    },
    setInfo(state, action: PayloadAction<UserSlice['info']>) {
      state.user.info = action.payload;
    },
    setUserData(state, action: PayloadAction<UserSlice>) {
      state.user = action.payload;
    },
  }
})

export const { setLoginData, setSignupData, setInfo, setUserData } = userSlice.actions;

export default userSlice.reducer;