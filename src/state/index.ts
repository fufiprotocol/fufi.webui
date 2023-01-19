import { configureStore, ThunkAction, Action, getDefaultMiddleware } from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux'

import baseInfo from './base/reducer';


const store = configureStore({
    reducer: {
        baseInfo,
    },
    middleware:  getDefaultMiddleware({
        thunk: true,
    }),
    devTools: process.env.NODE_ENV === 'development',
})

export default store;

export type AppState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch();


// thunk插件  需要配置的   thunk必须为true
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  AppState,
  unknown,
  Action<string>
>;
