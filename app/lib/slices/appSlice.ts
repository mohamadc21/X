import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ITwitt } from "../definitions";

interface AppState {
  twitts: ITwitt[] | [],
  replyTo: ITwitt | null
}

const initialState: AppState = {
  twitts: [],
  replyTo: null
}

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setTwitts(state, action: PayloadAction<ITwitt[]>) {
      state.twitts = action.payload;
    },
    setReplyTo(state, action: PayloadAction<ITwitt | null>) {
      state.replyTo = action.payload;
    }
  }
})

export const { setTwitts, setReplyTo } = appSlice.actions;

export default appSlice.reducer;