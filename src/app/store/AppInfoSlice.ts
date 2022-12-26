import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

import { Api } from "../Api";
import { RootState } from "./Store";





export interface AppInfoState {
    loadingState: "not-loaded" | "loading" | "loaded" | "error";
    hasAnyUsers: boolean | null;
}

const initialState: AppInfoState = {
    loadingState: "not-loaded",
    hasAnyUsers: null,
};

export const loadAppInfoAsync = createAsyncThunk(
    "appInfo/loadAppInfo",
    async (api: Api) => {
        const response = await api.appInfo.get();
        return response;
    },
);

export const refreshAppInfoAsync = createAsyncThunk(
    "appInfo/refreshAppInfo",
    async (api: Api) => {
        const response = await api.appInfo.get();
        return response;
    },
);

export const appInfoSlice = createSlice({
    name: "appInfo",
    initialState,
    reducers: {
        resetAppInfo: () => {
            return initialState;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loadAppInfoAsync.pending, state => {
                state.loadingState = "loading";
            })
            .addCase(loadAppInfoAsync.fulfilled, (state, action) => {
                state.hasAnyUsers = action.payload.hasAnyUsers;
                state.loadingState = "loaded";
            })
            .addCase(loadAppInfoAsync.rejected, state => {
                state.loadingState = "error";
            })
            .addCase(refreshAppInfoAsync.fulfilled, (state, action) => {
                state.hasAnyUsers = action.payload.hasAnyUsers;
                state.loadingState = "loaded";
            })
            .addCase(refreshAppInfoAsync.rejected, state => {
                state.loadingState = "error";
            });
    },
});

export const {
    resetAppInfo,
} = appInfoSlice.actions;

export const selectLoadingState = (state: RootState) => state.appInfo.loadingState;
export const selectHasAnyUsers = (state: RootState) => state.appInfo.hasAnyUsers;

export default appInfoSlice.reducer;
