import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import * as KvapiTypes from "@wpazderski/kvapi-types";

import { Api } from "../Api";
import { RootState } from "./Store";





export interface UserState {
    id: KvapiTypes.data.user.Id | null;
    role: KvapiTypes.data.user.Role;
    login: KvapiTypes.data.user.Login | null;
    lastPasswordUpdateTimestamp: number | null;
    isFullyLoaded: boolean;
}

const initialState: UserState = {
    id: null,
    role: "unauthorized",
    login: null,
    lastPasswordUpdateTimestamp: null,
    isFullyLoaded: false,
};

export const signInAsync = createAsyncThunk(
    "user/signIn",
    async (data: { userLogin: KvapiTypes.data.user.Login, userPassword: KvapiTypes.data.user.PlainPassword, api: Api }) => {
        const response = await data.api.sessions.create(data.userLogin, data.userPassword);
        return response;
    },
);

export const signOutAsync = createAsyncThunk(
    "user/signOut",
    async (api: Api) => {
        const response = await api.sessions.delete();
        return response;
    },
);

export const updateSelfAsync = createAsyncThunk(
    "user/updateSelf",
    async (api: Api) => {
        const response = await api.users.get(api.user!.id);
        if (!("lastPasswordUpdateTimestamp" in response)) {
            throw new Error("Updating self failed: not own user ID");
        }
        return response;
    },
);

export const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        resetUser: () => {
            return initialState;
        },
        setUserId: (state, action: PayloadAction<KvapiTypes.data.user.Id | null>) => {
            state.id = action.payload;
        },
        setUserRole: (state, action: PayloadAction<KvapiTypes.data.user.Role>) => {
            state.role = action.payload;
        },
        setUserLogin: (state, action: PayloadAction<KvapiTypes.data.user.Login | null>) => {
            state.login = action.payload;
        },
        setUserIsFullyLoaded: (state, action: PayloadAction<boolean>) => {
            state.isFullyLoaded = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(signInAsync.fulfilled, (state, action) => {
                state.id = action.payload.user.id;
                state.role = action.payload.user.role;
                state.login = action.payload.user.login;
                state.lastPasswordUpdateTimestamp = action.payload.user.lastPasswordUpdateTimestamp;
            })
            .addCase(signOutAsync.fulfilled, state => {
                state.id = null;
                state.role = "unauthorized";
                state.login = null;
                state.lastPasswordUpdateTimestamp = null;
            })
            .addCase(updateSelfAsync.fulfilled, (state, action) => {
                state.id = action.payload.id;
                state.role = action.payload.role;
                state.login = action.payload.login;
                state.lastPasswordUpdateTimestamp = action.payload.lastPasswordUpdateTimestamp;
            });
    },
});

export const {
    resetUser,
    setUserId,
    setUserRole,
    setUserLogin,
    setUserIsFullyLoaded,
} = userSlice.actions;

export const selectUserId = (state: RootState) => state.user.id;
export const selectUserRole = (state: RootState) => state.user.role;
export const selectUserLogin = (state: RootState) => state.user.login;
export const selectUserLastPasswordUpdateTimestamp = (state: RootState) => state.user.lastPasswordUpdateTimestamp;
export const selectUserIsFullyLoaded = (state: RootState) => state.user.isFullyLoaded;

export default userSlice.reducer;
