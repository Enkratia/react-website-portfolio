import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

import { backendApi } from "./backendApi";
import headerMenuBtn from "./headerMenuBtnSlice/slice";
import headerCartBtn from "./headerCartBtnSlice/slice";
import favorite from "./favoriteSlice/slice";
import cart from "./cartSlice/slice";
import log from "./headerLogSlice/slice";
import shipping from "./shippingSlice/slice";

export const store = configureStore({
  reducer: {
    shipping,
    log,
    cart,
    favorite,
    headerMenuBtn,
    headerCartBtn,
    [backendApi.reducerPath]: backendApi.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(backendApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
export const useAppDispatch: () => AppDispatch = useDispatch;

export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
