import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SignupData } from "../definitions";

export type SignupSlice = {
  data: SignupData | null,
  step: 1 | 2 | 3 | 4 | 5 | 6,
}

export type LoginSlice = {
  email_username: string | null,
  step: 1 | 2
}

interface UserState {
  signup: SignupSlice
  login: LoginSlice
}

const initialState: UserState = {
  signup: {
    data: null,
    step: 1
  },
  login: {
    email_username: null,
    step: 1
  }
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
    }
  }
})

export const { setLoginData, setSignupData } = userSlice.actions;

export default userSlice.reducer;