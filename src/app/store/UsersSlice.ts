import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as KvapiTypes from "@wpazderski/kvapi-types";

import { Api } from "../Api";
import { RootState } from "./Store";

export type Lang = KvapiTypes.Opaque<string, typeof __Lang>; declare const __Lang: unique symbol;
export type ExternalDataCacheLifetime = KvapiTypes.Opaque<number, typeof __ExternalDataCacheLifetime>; declare const __ExternalDataCacheLifetime: unique symbol;

export interface UsersState {
    usersList: KvapiTypes.data.user.UsersPublic;
}

export const initialState: UsersState = {
    usersList: [],
};

export const loadUsersListAsync = createAsyncThunk(
    "users/loadUsersList",
    async (api: Api) => {
        const response = await api.users.getAll();
        return response;
    },
);

export const loadUserAsync = createAsyncThunk(
    "users/loadUser",
    async (data: { userId: KvapiTypes.data.user.Id, api: Api }) => {
        const response = await data.api.users.get(data.userId);
        return response;
    },
);

export const addUserAsync = createAsyncThunk(
    "users/addUser",
    async (data: { user: KvapiTypes.api.users.CreateUserRequest, api: Api }) => {
        const response = await data.api.users.create(data.user);
        return response;
    },
);

export const removeUserAsync = createAsyncThunk(
    "users/removeUser",
    async (data: { userId: KvapiTypes.data.user.Id, api: Api }) => {
        await data.api.users.delete(data.userId);
        return data.userId;
    },
);

export const updateUserAsync = createAsyncThunk(
    "users/updateUser",
    async (data: { userId: KvapiTypes.data.user.Id, user: KvapiTypes.api.users.UpdateUserRequest, api: Api }) => {
        const response = await data.api.users.update(data.userId, data.user);
        return response;
    },
);


export const usersSlice = createSlice({
    name: "users",
    initialState,
    reducers: {
        resetUsers: () => {
            return initialState;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loadUsersListAsync.fulfilled, (state, action) => {
                state.usersList = action.payload;
            })
            .addCase(addUserAsync.fulfilled, (state, action) => {
                state.usersList.push(action.payload);
            })
            .addCase(removeUserAsync.fulfilled, (state, action) => {
                const idx = state.usersList.findIndex(user => user.id === action.payload);
                if (idx >= 0) {
                    state.usersList.splice(idx, 1);
                }
            })
            .addCase(updateUserAsync.fulfilled, (state, action) => {
                const idx = state.usersList.findIndex(user => user.id === action.payload.id);
                if (idx >= 0) {
                    state.usersList[idx] = action.payload;
                }
            });
    },
});

export const {
    resetUsers,
} = usersSlice.actions;

export const selectUsersList = (state: RootState) => state.users.usersList;

export default usersSlice.reducer;
