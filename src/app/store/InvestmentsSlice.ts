import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import * as KvapiTypes from "@wpazderski/kvapi-types";
import * as WalletsTypes from "@wpazderski/wallets-types";

import { Api } from "../Api";
import { Utils } from "../Utils";
import { Duration } from "./CommonTypes";
import { InvestmentTypeId } from "./InvestmentTypesSlice";
import { RootState, store } from "./Store";
import { defaultWalletId, WalletId } from "./WalletsSlice";

export type InvestmentId = KvapiTypes.Opaque<string, typeof __InvestmentId>; declare const __InvestmentId: unique symbol;
export type InvestmentVersion = KvapiTypes.Opaque<number, typeof __InvestmentVersion>; declare const __InvestmentVersion: unique symbol;
export type InvestmentName = KvapiTypes.Opaque<string, typeof __InvestmentName>; declare const __InvestmentName: unique symbol;

export interface InvestmentPurchase_AnyAmountOfMoney {
    type: "anyAmountOfMoney";
    amountOfMoney: number;
    currency: WalletsTypes.data.currency.Id;
}
export interface InvestmentPurchase_IntegerUnits {
    type: "integerUnits";
    numUnits: number;
    unitPrice: number;
    currency: WalletsTypes.data.currency.Id;
}
export interface InvestmentPurchase_DecimalUnits {
    type: "decimalUnits";
    numUnits: number;
    unitPrice: number;
    currency: WalletsTypes.data.currency.Id;
}
export type InvestmentWeightUnit = "g" | "kg" | "t.oz";
export interface InvestmentPurchase_Weight {
    type: "weight";
    weight: number;
    unit: InvestmentWeightUnit;
    price: number;
    currency: WalletsTypes.data.currency.Id;
}
export type InvestmentPurchase = InvestmentPurchase_AnyAmountOfMoney
    | InvestmentPurchase_IntegerUnits
    | InvestmentPurchase_DecimalUnits
    | InvestmentPurchase_Weight;

export interface InvestmentValueCalculationMethod_Interest {
    type: "interest";
}
export interface InvestmentValueCalculationMethod_Manual {
    type: "manual";
    currentValue: number;
}
export interface InvestmentValueCalculationMethod_Obtainer {
    type: "obtainer";
    ticker: WalletsTypes.data.market.Ticker;
}
export interface InvestmentValueCalculationMethod_Cryptocurrency {
    type: "cryptocurrency";
    cryptocurrencyId: WalletsTypes.data.cryptocurrency.Id;
}
export type InvestmentValueCalculationMethod = InvestmentValueCalculationMethod_Interest
    | InvestmentValueCalculationMethod_Manual
    | InvestmentValueCalculationMethod_Obtainer
    | InvestmentValueCalculationMethod_Cryptocurrency;

export interface InvestmentInterestPeriod {
    id: string;
    repeats: number;
    duration: Duration;
    interestRate: InvestmentInterestInterestRate;
    cancellationPolicy: InvestmentInterestPeriodCancellationPolicy;
}
export interface InvestmentInterestInterestRate {
    additivePercent: number;
    additiveInflation: boolean;
    additiveReferenceRate: boolean;
}

export interface InvestmentCancellationPolicy {
    fixedPenalty: number;
    percentOfTotalInterest: number;
    limitedToTotalInterest: boolean;
}

export interface InvestmentInterestPeriodCancellationPolicy extends InvestmentCancellationPolicy {
    percentOfInterestPeriodInterest: number;
    limitedToInterestPeriodInterest: boolean;
}

export type InvestmentTargetCurrencyId = KvapiTypes.Opaque<WalletsTypes.data.currency.Id, typeof __InvestmentTargetCurrencyId>; declare const __InvestmentTargetCurrencyId: unique symbol;
export type InvestmentTargetIndustryId = KvapiTypes.Opaque<string, typeof __InvestmentTargetIndustryId>; declare const __InvestmentTargetIndustryId: unique symbol;
export type InvestmentTargetWorldAreaId = KvapiTypes.Opaque<string, typeof __InvestmentTargetWorldAreaId>; declare const __InvestmentTargetWorldAreaId: unique symbol;

export interface InvestmentTarget<T> {
    id: T;
    percentage: number;
}

export interface Investment {
    id: InvestmentId;
    version: InvestmentVersion;
    name: InvestmentName;
    type: InvestmentTypeId;
    walletId: WalletId;
    startDate: KvapiTypes.Timestamp | null;
    endDate: KvapiTypes.Timestamp | null;
    purchase: InvestmentPurchase;
    valueCalculationMethod: InvestmentValueCalculationMethod;
    interestPeriods: InvestmentInterestPeriod[];
    capitalization: boolean;
    incomeTaxApplicable: boolean;
    cancellationPolicy: InvestmentCancellationPolicy;
    targetCurrencies: InvestmentTarget<InvestmentTargetCurrencyId>[];
    targetIndustries: InvestmentTarget<InvestmentTargetIndustryId>[];
    targetWorldAreas: InvestmentTarget<InvestmentTargetWorldAreaId>[];
}

export type InvestmentSpec = Omit<Investment, "id">;

export interface InvestmentsState {
    investmentsList: Investment[];
    loadingState: "not-loaded" | "loading" | "loaded" | "failed" | "failed-not-found";
}

export const initialState: InvestmentsState = {
    investmentsList: [],
    loadingState: "not-loaded",
};

export function getEmptyInvestment(investmentTypeId: InvestmentTypeId): Investment {
    const state = store.getState();
    const currencies = state.userSettings.currencies;
    const mainCurrencyId = state.userSettings.mainCurrencyId;
    const currency = currencies.find(currency => currency.id === mainCurrencyId)!;
    return {
        id: "" as InvestmentId,
        version: 1 as InvestmentVersion,
        name: "" as InvestmentName,
        type: investmentTypeId,
        walletId: defaultWalletId,
        startDate: null,
        endDate: null,
        purchase: {
            type: "anyAmountOfMoney",
            amountOfMoney: 1000,
            currency: currency.id,
        },
        valueCalculationMethod: {
            type: "manual",
            currentValue: 1000,
        },
        interestPeriods: [],
        capitalization: false,
        incomeTaxApplicable: true,
        cancellationPolicy: {
            fixedPenalty: 0,
            limitedToTotalInterest: false,
            percentOfTotalInterest: 0,
        },
        targetCurrencies: [],
        targetIndustries: [],
        targetWorldAreas: [],
    };
}

export function getWeightUnits(): InvestmentWeightUnit[] {
    return ["g", "kg", "t.oz"];
}

const entryKey = "investments" as KvapiTypes.data.entry.Key;

export const loadInvestmentsAsync = createAsyncThunk(
    "investments/loadInvestments",
    async (api: Api) => {
        const response = await api.privateEntries.get(entryKey);
        return JSON.parse(response) as InvestmentsState;
    },
);

export const saveInvestmentsAsync = createAsyncThunk(
    "investments/saveInvestments",
    async (data: { investments: InvestmentsState, api: Api }) => {
        const entryValue = JSON.stringify(data.investments) as KvapiTypes.data.entry.Value;
        await data.api.privateEntries.set(entryKey, entryValue);
    },
);

export const addInvestmentAsync = createAsyncThunk(
    "investments/addInvestment",
    async (data: { investment: Investment, api: Api }) => {
        const investments = {...store.getState().investments};
        const investmentsList = [...investments.investmentsList];
        investments.investmentsList = investmentsList;
        let id: InvestmentId | null = null;
        while (id === null) {
            id = Utils.randomString(12) as InvestmentId;
            const _id = id;
            if (investmentsList.find(investment => investment.id === _id)) {
                id = null;
            }
        }
        investmentsList.push({
            ...data.investment,
            id,
        });
        const entryValue = JSON.stringify(investments) as KvapiTypes.data.entry.Value;
        await data.api.privateEntries.set(entryKey, entryValue);
        return investmentsList;
    },
);

export const removeInvestmentAsync = createAsyncThunk(
    "investments/removeInvestment",
    async (data: { investmentId: InvestmentId, api: Api }) => {
        const investments = {...store.getState().investments};
        const investmentsList = [...investments.investmentsList];
        investments.investmentsList = investmentsList;
        const idx = investmentsList.findIndex(investment => investment.id === data.investmentId);
        if (idx >= 0) {
            investmentsList.splice(idx, 1);
        }
        const entryValue = JSON.stringify(investments) as KvapiTypes.data.entry.Value;
        await data.api.privateEntries.set(entryKey, entryValue);
        return investmentsList;
    },
);

export const updateInvestmentAsync = createAsyncThunk(
    "investments/updateInvestment",
    async (data: { investment: Investment, api: Api }) => {
        data.investment.version++;
        const investments = {...store.getState().investments};
        const investmentsList = [...investments.investmentsList];
        investments.investmentsList = investmentsList;
        const idx = investmentsList.findIndex(investment => investment.id === data.investment.id);
        if (idx >= 0) {
            investmentsList[idx] = data.investment;
        }
        const entryValue = JSON.stringify(investments) as KvapiTypes.data.entry.Value;
        await data.api.privateEntries.set(entryKey, entryValue);
        return investmentsList;
    },
);

export const investmentsSlice = createSlice({
    name: "investments",
    initialState,
    reducers: {
        resetInvestments: () => {
            return initialState;
        },
        setInvestments: (state, action: PayloadAction<InvestmentsState | null>) => {
            const data = action.payload ?? initialState;
            state.investmentsList = data.investmentsList;
            state.loadingState = data.loadingState;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loadInvestmentsAsync.fulfilled, (state, action) => {
                state.loadingState = "loaded";
                state.investmentsList = action.payload.investmentsList;
            })
            .addCase(loadInvestmentsAsync.pending, state => {
                state.loadingState = "loading";
            })
            .addCase(loadInvestmentsAsync.rejected, (state, action) => {
                if (action.error.message?.includes("404 Not Found")) {
                    state.loadingState = "failed-not-found";
                }
            })
            .addCase(addInvestmentAsync.fulfilled, (state, action) => {
                state.loadingState = "loaded";
                state.investmentsList = action.payload;
            })
            .addCase(removeInvestmentAsync.fulfilled, (state, action) => {
                state.loadingState = "loaded";
                state.investmentsList = action.payload;
            })
            .addCase(updateInvestmentAsync.fulfilled, (state, action) => {
                state.loadingState = "loaded";
                state.investmentsList = action.payload;
            });
    },
});

export const {
    resetInvestments,
    setInvestments,
} = investmentsSlice.actions;

export const selectInvestments = (state: RootState) => state.investments;
export const selectInvestmentsList = (state: RootState) => state.investments.investmentsList;
export const selectInvestmentTargetIndustryIds = (state: RootState) => {
    const industries = new Set<InvestmentTargetIndustryId>();
    for (const investment of state.investments.investmentsList) {
        for (const industry of investment.targetIndustries) {
            industries.add(industry.id);
        }
    }
    return Array.from(industries);
};
export const selectInvestmentsLoadingState = (state: RootState) => state.investments.loadingState;
export const selectInvestmentsTickers = (state: RootState) => getAllTickers(state.investments.investmentsList);

export function getAllTickers(investments: Investment[]): WalletsTypes.data.market.Ticker[] {
    const tickers: WalletsTypes.data.market.Ticker[] = [];
    for (const investment of investments) {
        if (investment.valueCalculationMethod.type === "obtainer") {
            if (!tickers.includes(investment.valueCalculationMethod.ticker)) {
                tickers.push(investment.valueCalculationMethod.ticker);
            }
        }
    }
    return tickers;
}

export function getInvestmentValueFromPurchase(purchase: InvestmentPurchase): number {
    if (purchase.type === "anyAmountOfMoney") {
        return purchase.amountOfMoney;
    }
    else if (purchase.type === "decimalUnits" || purchase.type === "integerUnits") {
        return purchase.unitPrice * purchase.numUnits;
    }
    else {
        return purchase.price * purchase.weight;
    }
}

export default investmentsSlice.reducer;
