import { AlertColor } from "@mui/material";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { RootState, store } from "./Store";





export enum UserMessageDuration {
    ERROR = 5000,
    SUCCESS = 5000,
    PERMANENT = -1,
}

export interface UserMessage {
    id: number;
    message: string;
    type: AlertColor;
    duration: UserMessageDuration;
}

export type UserMessageSpec = Omit<UserMessage, "id">;

export interface AppState {
    userMessages: UserMessage[];
}

const initialState: AppState = {
    userMessages: [],
};

let nextUserMessageId: number = 0;

export const appSlice = createSlice({
    name: "app",
    initialState,
    reducers: {
        resetApp: () => {
            return initialState;
        },
        showUserMessage: (state, action: PayloadAction<UserMessageSpec>) => {
            const userMessage: UserMessage = {
                ...action.payload,
                id: nextUserMessageId++,
            };
            state.userMessages.push(userMessage);
            if (userMessage.duration !== UserMessageDuration.PERMANENT) {
                setTimeout(() => {
                    store.dispatch(appSlice.actions.hideUserMessage(userMessage.id));
                }, userMessage.duration);
            }
        },
        hideUserMessage: (state, action: PayloadAction<number>) => {
            const idx = state.userMessages.findIndex(userMessage => userMessage.id === action.payload);
            if (idx >= 0) {
                state.userMessages.splice(idx, 1);
            }
        },
        removeAllUserMessages: state => {
            state.userMessages.length = 0;
        },
    },
});

export const {
    resetApp,
    showUserMessage,
    hideUserMessage,
    removeAllUserMessages,
} = appSlice.actions;

export const selectUserMessages = (state: RootState) => state.app.userMessages;

export default appSlice.reducer;
