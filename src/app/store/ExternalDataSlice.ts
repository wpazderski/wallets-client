import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import * as Types from "@wpazderski/wallets-types";

import { Api } from "../Api";
import { RootState } from "./Store";

export interface ExternalDataState extends Types.api.externalData.ExternalData {
    loadingState: "not-loaded" | "loading" | "loaded" | "error";
}

const initialState: ExternalDataState = {
    loadingState: "not-loaded",
    currencies: [],
    cryptocurrencies: [],
    exchangeRates: {},
    cryptocurrencyExchangeRates: {},
    monthlyInflationRates: [],
    monthlyReferenceRates: [],
    tickerData: [],
    lastUpdateTimestamp: -1,
};

export type AutomaticDataUpdateOptionId = "disabled" | "on-every-login" | "hourly" | "daily" | "weekly";

export function getAvailableAutomaticDataUpdateOptions(): Array<{ id: AutomaticDataUpdateOptionId, cacheMaxLifetime: number }> {
    return [
        { id: "disabled", cacheMaxLifetime: 100 * 365 * 24 * 3600 * 1000 },
        { id: "on-every-login", cacheMaxLifetime: 0 },
        { id: "hourly", cacheMaxLifetime: 3600 * 1000 },
        { id: "daily", cacheMaxLifetime: 24 * 3600 * 1000 },
        { id: "weekly", cacheMaxLifetime: 7 * 24 * 3600 * 1000 },
    ];
}

export const defaultAvailableAutomaticDataUpdateOption: { id: AutomaticDataUpdateOptionId, cacheMaxLifetime: number } = getAvailableAutomaticDataUpdateOptions().find(x => x.id === "daily")!;

export const loadExternalDataAsync = createAsyncThunk(
    "externalData/loadExternalData",
    async (data: { tickers: Types.data.market.Ticker[], cacheMaxLifetime: number, api: Api }) => {
        const response = await data.api.externalData.get({
            tickers: data.tickers.filter(ticker => !!ticker),
            cacheMaxLifetime: data.cacheMaxLifetime,
        });
        return response;
    },
);

export const externalDataSlice = createSlice({
    name: "externalData",
    initialState,
    reducers: {
        resetExternalData: () => {
            return initialState;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loadExternalDataAsync.pending, state => {
                state.loadingState = "loading";
            })
            .addCase(loadExternalDataAsync.fulfilled, (state, action) => {
                state.currencies = action.payload.currencies;
                state.cryptocurrencies = action.payload.cryptocurrencies;
                state.exchangeRates = action.payload.exchangeRates;
                state.cryptocurrencyExchangeRates = action.payload.cryptocurrencyExchangeRates;
                state.monthlyInflationRates = action.payload.monthlyInflationRates;
                state.monthlyReferenceRates = action.payload.monthlyReferenceRates;
                state.tickerData = action.payload.tickerData;
                state.lastUpdateTimestamp = action.payload.lastUpdateTimestamp;
                state.loadingState = "loaded";
            })
            .addCase(loadExternalDataAsync.rejected, state => {
                state.loadingState = "error";
            });
    },
});

export const {
    resetExternalData,
} = externalDataSlice.actions;

export const selectExternalData = (state: RootState) => state.externalData;
export const selectLoadingState = (state: RootState) => state.externalData.loadingState;
export const selectCryptocurrencies = (state: RootState) => state.externalData.cryptocurrencies;
export const selectCurrencies = (state: RootState) => state.externalData.currencies;
export const selectExchangeRates = (state: RootState) => state.externalData.exchangeRates;
export const selectCryptocurrencyExchangeRates = (state: RootState) => state.externalData.cryptocurrencyExchangeRates;
export const selectMonthlyInflationRates = (state: RootState) => state.externalData.monthlyInflationRates;
export const selectMonthlyReferenceRates = (state: RootState) => state.externalData.monthlyReferenceRates;
export const selectTickerData = (state: RootState) => state.externalData.tickerData;
export const selectLastUpdateTimestamp = (state: RootState) => state.externalData.lastUpdateTimestamp;

export default externalDataSlice.reducer;
