import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ITwitt } from "../definitions";

interface AppState {
  twitts: ITwitt[] | [],
  isChangingRoute: boolean
}

const initialState: AppState = {
  twitts: [],
  isChangingRoute: false
}

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setTwitts(state, action: PayloadAction<ITwitt[]>) {
      state.twitts = action.payload;
    },
    setIsChangingRoute(state, action: PayloadAction<boolean>) {
      state.isChangingRoute = action.payload;
    }
  }
})

export const { setTwitts, setIsChangingRoute } = appSlice.actions;

export default appSlice.reducer;