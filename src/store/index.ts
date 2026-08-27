import { configureStore } from '@reduxjs/toolkit';
import scoresReducer from './scoresSlice';

export const store = configureStore({
  reducer: {
    scores: scoresReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
