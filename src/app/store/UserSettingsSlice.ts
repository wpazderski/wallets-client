import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import * as KvapiTypes from "@wpazderski/kvapi-types";
import * as WalletsTypes from "@wpazderski/wallets-types";

import { Api } from "../Api";
import { defaultAvailableAutomaticDataUpdateOption } from "./ExternalDataSlice";
import { RootState } from "./Store";





export type Lang = KvapiTypes.Opaque<string, typeof __Lang>; declare const __Lang: unique symbol;
export type ExternalDataCacheLifetime = KvapiTypes.Opaque<number, typeof __ExternalDataCacheLifetime>; declare const __ExternalDataCacheLifetime: unique symbol;
export type IncomeTaxRate = KvapiTypes.Opaque<number, typeof __IncomeTaxRate>; declare const __IncomeTaxRate: unique symbol;
export type IncomeTaxAllowance = KvapiTypes.Opaque<number, typeof __IncomeTaxAllowance>; declare const __IncomeTaxAllowance: unique symbol;

export interface UserSettingsState {
    lang: Lang;
    currencies: WalletsTypes.data.currency.Currency[];
    includeCancellationFees: boolean;
    includeIncomeTax: boolean;
    mainCurrencyId: WalletsTypes.data.currency.Id;
    incomeTaxRate: IncomeTaxRate;
    incomeTaxAllowance: IncomeTaxAllowance;
    externalDataCacheLifetime: ExternalDataCacheLifetime;
}

export const initialState: UserSettingsState = {
    lang: "" as Lang,
    currencies: [{ id: "EUR", name: "Euro" }] as WalletsTypes.data.currency.Currency[],
    includeCancellationFees: false,
    includeIncomeTax: false,
    mainCurrencyId: "EUR" as WalletsTypes.data.currency.Id,
    incomeTaxRate: 0 as IncomeTaxRate,
    incomeTaxAllowance: 0 as IncomeTaxAllowance,
    externalDataCacheLifetime: defaultAvailableAutomaticDataUpdateOption.cacheMaxLifetime as ExternalDataCacheLifetime,
};

const entryKey = "user-settings" as KvapiTypes.data.entry.Key;

export const loadUserSettingsAsync = createAsyncThunk(
    "userSettings/loadUserSettings",
    async (api: Api) => {
        const response = await api.privateEntries.get(entryKey);
        return JSON.parse(response) as UserSettingsState;
    },
);

export const saveUserSettingsAsync = createAsyncThunk(
    "userSettings/saveUserSettings",
    async (data: { userSettings: UserSettingsState, api: Api }) => {
        const entryValue = JSON.stringify(data.userSettings) as KvapiTypes.data.entry.Value;
        const response = await data.api.privateEntries.set(entryKey, entryValue);
        return response;
    },
);

export const userSettingsSlice = createSlice({
    name: "userSettings",
    initialState,
    reducers: {
        resetUserSettings: () => {
            return initialState;
        },
        setUserSettings: (state, action: PayloadAction<UserSettingsState | null>) => {
            const data = action.payload ?? initialState;
            state.lang = data.lang;
            state.currencies = data.currencies;
            state.includeCancellationFees = data.includeCancellationFees;
            state.includeIncomeTax = data.includeIncomeTax;
            state.mainCurrencyId = data.mainCurrencyId;
            state.incomeTaxRate = data.incomeTaxRate;
            state.incomeTaxAllowance = data.incomeTaxAllowance;
            state.externalDataCacheLifetime = data.externalDataCacheLifetime;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loadUserSettingsAsync.fulfilled, (state, action) => {
                state.lang = action.payload.lang;
                state.currencies = action.payload.currencies;
                state.includeCancellationFees = action.payload.includeCancellationFees;
                state.includeIncomeTax = action.payload.includeIncomeTax;
                state.mainCurrencyId = action.payload.mainCurrencyId;
                state.incomeTaxRate = action.payload.incomeTaxRate;
                state.incomeTaxAllowance = action.payload.incomeTaxAllowance;
                state.externalDataCacheLifetime = action.payload.externalDataCacheLifetime;
            });
    },
});

export const {
    resetUserSettings,
    setUserSettings,
} = userSettingsSlice.actions;

export const selectUserSettings = (state: RootState) => state.userSettings;
export const selectUserLang = (state: RootState) => state.userSettings.lang;
export const selectUserCurrencies = (state: RootState) => state.userSettings.currencies;
export const selectUserIncludeCancellationFees = (state: RootState) => state.userSettings.includeCancellationFees;
export const selectUserIncludeIncomeTax = (state: RootState) => state.userSettings.includeIncomeTax;
export const selectUserMainCurrencyId = (state: RootState) => state.userSettings.mainCurrencyId;
export const selectUserIncomeTaxRate = (state: RootState) => state.userSettings.incomeTaxRate;
export const selectUserIncomeTaxAllowance = (state: RootState) => state.userSettings.incomeTaxAllowance;
export const selectUserExternalDataCacheLifetime = (state: RootState) => state.userSettings.externalDataCacheLifetime;

export default userSettingsSlice.reducer;
