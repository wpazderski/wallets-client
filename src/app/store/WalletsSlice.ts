import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import * as KvapiTypes from "@wpazderski/kvapi-types";

import { Api } from "../Api";
import { Utils } from "../Utils";
import { RootState, store } from "./Store";





export type WalletId = KvapiTypes.Opaque<string, typeof __WalletId>; declare const __WalletId: unique symbol;
export type WalletName = KvapiTypes.Opaque<string, typeof __WalletName>; declare const __WalletName: unique symbol;
export type WalletDescription = KvapiTypes.Opaque<string, typeof __WalletDescription>; declare const __WalletDescription: unique symbol;

export interface Wallet {
    id: WalletId;
    name: WalletName;
    description: WalletDescription;
    isPredefined: boolean;
}

export type WalletSpec = Omit<Wallet, "id">;

export interface WalletsState {
    walletsList: Wallet[];
    loadingState: "not-loaded" | "loading" | "loaded" | "failed" | "failed-not-found";
}

export const defaultWalletId = "unassigned" as WalletId;

const initialState: WalletsState = {
    walletsList: [
        {
            id: defaultWalletId,
            name: "common.wallets.unassigned.name" as WalletName,
            description: "common.wallets.unassigned.description" as WalletDescription,
            isPredefined: true,
        },
    ],
    loadingState: "not-loaded",
};

const entryKey = "wallets" as KvapiTypes.data.entry.Key;

export const loadWalletsAsync = createAsyncThunk(
    "wallets/loadWallets",
    async (api: Api) => {
        const response = await api.privateEntries.get(entryKey);
        return JSON.parse(response) as WalletsState;
    },
);

export const saveWalletsAsync = createAsyncThunk(
    "wallets/saveWallets",
    async (data: { wallets: WalletsState, api: Api }) => {
        const entryValue = JSON.stringify(data.wallets) as KvapiTypes.data.entry.Value;
        await data.api.privateEntries.set(entryKey, entryValue);
    },
);

export const addWalletAsync = createAsyncThunk(
    "wallets/addWallet",
    async (data: { wallet: Wallet, api: Api }) => {
        const wallets = {...store.getState().wallets};
        const walletsList = [...wallets.walletsList];
        wallets.walletsList = walletsList;
        let id: WalletId | null = null;
        while (id === null) {
            id = Utils.randomString(12) as WalletId;
            const _id = id;
            if (walletsList.find(Wallet => Wallet.id === _id)) {
                id = null;
            }
        }
        walletsList.push({
            ...data.wallet,
            id,
        });
        const entryValue = JSON.stringify(wallets) as KvapiTypes.data.entry.Value;
        await data.api.privateEntries.set(entryKey, entryValue);
        return walletsList;
    },
);

export const removeWalletAsync = createAsyncThunk(
    "wallets/removeWallet",
    async (data: { walletId: WalletId, api: Api }) => {
        const wallets = {...store.getState().wallets};
        const walletsList = [...wallets.walletsList];
        wallets.walletsList = walletsList;
        const idx = walletsList.findIndex(Wallet => Wallet.id === data.walletId);
        if (idx >= 0) {
            walletsList.splice(idx, 1);
        }
        const entryValue = JSON.stringify(wallets) as KvapiTypes.data.entry.Value;
        await data.api.privateEntries.set(entryKey, entryValue);
        return walletsList;
    },
);

export const updateWalletAsync = createAsyncThunk(
    "wallets/updateWallet",
    async (data: { wallet: Wallet, api: Api }) => {
        const wallets = {...store.getState().wallets};
        const walletsList = [...wallets.walletsList];
        wallets.walletsList = walletsList;
        const idx = walletsList.findIndex(Wallet => Wallet.id === data.wallet.id);
        if (idx >= 0) {
            walletsList[idx] = data.wallet;
        }
        const entryValue = JSON.stringify(wallets) as KvapiTypes.data.entry.Value;
        await data.api.privateEntries.set(entryKey, entryValue);
        return walletsList;
    },
);

export const walletsSlice = createSlice({
    name: "wallets",
    initialState,
    reducers: {
        resetWallets: () => {
            return initialState;
        },
        setWallets: (state, action: PayloadAction<WalletsState | null>) => {
            const data = action.payload ?? initialState;
            state.walletsList = data.walletsList;
            state.loadingState = data.loadingState;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loadWalletsAsync.fulfilled, (state, action) => {
                state.loadingState = "loaded";
                state.walletsList = action.payload.walletsList;
            })
            .addCase(loadWalletsAsync.pending, (state, action) => {
                state.loadingState = "loading";
            })
            .addCase(loadWalletsAsync.rejected, (state, action) => {
                if (action.error.message?.includes("404 Not Found")) {
                    state.loadingState = "failed-not-found";
                }
            })
            .addCase(addWalletAsync.fulfilled, (state, action) => {
                state.loadingState = "loaded";
                state.walletsList = action.payload;
            })
            .addCase(removeWalletAsync.fulfilled, (state, action) => {
                state.loadingState = "loaded";
                state.walletsList = action.payload;
            })
            .addCase(updateWalletAsync.fulfilled, (state, action) => {
                state.loadingState = "loaded";
                state.walletsList = action.payload;
            });
    },
});

export const {
    resetWallets,
    setWallets,
} = walletsSlice.actions;

export const selectWallets = (state: RootState) => state.wallets;
export const selectWalletsList = (state: RootState) => state.wallets.walletsList;
export const selectWalletsLoadingState = (state: RootState) => state.wallets.loadingState;

export default walletsSlice.reducer;
