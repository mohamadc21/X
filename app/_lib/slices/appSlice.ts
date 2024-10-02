import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ITwitt } from "../definitions";

interface AppState {
  twitts: ITwitt[] | [],
}

const initialState: AppState = {
  twitts: [],
}

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setTwitts(state, action: PayloadAction<ITwitt[]>) {
      state.twitts = action.payload;
    },
  }
})

export const { setTwitts } = appSlice.actions;

export default appSlice.reducer;