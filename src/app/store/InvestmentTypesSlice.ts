import * as faSolid from "@fortawesome/free-solid-svg-icons";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import * as KvapiTypes from "@wpazderski/kvapi-types";

import { Api } from "../Api";
import { Utils } from "../Utils";
import { RootState, store } from "./Store";





export type InvestmentTypeId = KvapiTypes.Opaque<string, typeof __InvestmentTypeId>; declare const __InvestmentTypeId: unique symbol;
export type InvestmentTypeName = KvapiTypes.Opaque<string, typeof __InvestmentTypeName>; declare const __InvestmentTypeName: unique symbol;
export type InvestmentTypeSlug = KvapiTypes.Opaque<string, typeof __InvestmentTypeSlug>; declare const __InvestmentTypeSlug: unique symbol;
export type InvestmentTypePurchase = "anyAmountOfMoney" | "integerUnits" | "decimalUnits" | "weight";
export type InvestmentTypeValueCalculationMethod = "interest" | "manual" | "obtainer" | "cryptocurrency";

export function getInvestmentTypePurchases(): InvestmentTypePurchase[] {
    return ["anyAmountOfMoney", "integerUnits", "decimalUnits", "weight"];
}

export function getInvestmentTypeValueCalculationMethods(): InvestmentTypeValueCalculationMethod[] {
    return ["interest", "manual", "obtainer", "cryptocurrency"];
}

export interface InvestmentType {
    id: InvestmentTypeId;
    isPredefined: boolean;
    name: InvestmentTypeName;
    slug: InvestmentTypeSlug;
    icon: faSolid.IconLookup;
    purchase: InvestmentTypePurchase;
    valueCalculationMethod: InvestmentTypeValueCalculationMethod;
    enableInterest: boolean;
    enableEndDate: boolean;
    enableCancellationPolicy: boolean;
    enableCurrencies: boolean;
    enableIndustries: boolean;
    enableWorldAreas: boolean;
    showInSidebar: boolean;
}

export type InvestmentTypeSpec = Omit<InvestmentType, "id">;

export interface InvestmentTypesState {
    investmentsTypesList: InvestmentType[];
    loadingState: "not-loaded" | "loading" | "loaded" | "failed" | "failed-not-found";
}

export const initialState: InvestmentTypesState = {
    investmentsTypesList: [
        {
            id: "deposits" as InvestmentTypeId,
            isPredefined: true,
            name: "deposits" as InvestmentTypeName,
            slug: "deposits" as InvestmentTypeSlug,
            icon: JSON.parse(JSON.stringify(faSolid.faVault)),
            purchase: "anyAmountOfMoney",
            valueCalculationMethod: "interest",
            enableInterest: true,
            enableEndDate: true,
            enableCancellationPolicy: true,
            enableCurrencies: true,
            enableIndustries: false,
            enableWorldAreas: false,
            showInSidebar: true,
        },
        {
            id: "treasuryBonds" as InvestmentTypeId,
            isPredefined: true,
            name: "treasuryBonds" as InvestmentTypeName,
            slug: "treasuryBonds" as InvestmentTypeSlug,
            icon: JSON.parse(JSON.stringify(faSolid.faLandmarkFlag)),
            purchase: "integerUnits",
            valueCalculationMethod: "interest",
            enableInterest: true,
            enableEndDate: true,
            enableCancellationPolicy: true,
            enableCurrencies: true,
            enableIndustries: true,
            enableWorldAreas: true,
            showInSidebar: true,
        },
        {
            id: "marketInvestments" as InvestmentTypeId,
            isPredefined: true,
            name: "marketInvestments" as InvestmentTypeName,
            slug: "marketInvestments" as InvestmentTypeSlug,
            icon: JSON.parse(JSON.stringify(faSolid.faArrowTrendUp)),
            purchase: "decimalUnits",
            valueCalculationMethod: "obtainer",
            enableInterest: false,
            enableEndDate: false,
            enableCancellationPolicy: false,
            enableCurrencies: true,
            enableIndustries: true,
            enableWorldAreas: true,
            showInSidebar: true,
        },
        {
            id: "realEstate" as InvestmentTypeId,
            isPredefined: true,
            name: "realEstate" as InvestmentTypeName,
            slug: "realEstate" as InvestmentTypeSlug,
            icon: JSON.parse(JSON.stringify(faSolid.faHouse)),
            purchase: "anyAmountOfMoney",
            valueCalculationMethod: "manual",
            enableInterest: false,
            enableEndDate: false,
            enableCancellationPolicy: false,
            enableCurrencies: false,
            enableIndustries: false,
            enableWorldAreas: true,
            showInSidebar: true,
        },
        {
            id: "gold" as InvestmentTypeId,
            isPredefined: true,
            name: "gold" as InvestmentTypeName,
            slug: "gold" as InvestmentTypeSlug,
            icon: JSON.parse(JSON.stringify(faSolid.faCoins)),
            purchase: "weight",
            valueCalculationMethod: "obtainer",
            enableInterest: false,
            enableEndDate: false,
            enableCancellationPolicy: false,
            enableCurrencies: false,
            enableIndustries: false,
            enableWorldAreas: false,
            showInSidebar: true,
        },
        {
            id: "valuables" as InvestmentTypeId,
            isPredefined: true,
            name: "valuables" as InvestmentTypeName,
            slug: "valuables" as InvestmentTypeSlug,
            icon: JSON.parse(JSON.stringify(faSolid.faTrophy)),
            purchase: "anyAmountOfMoney",
            valueCalculationMethod: "manual",
            enableInterest: false,
            enableEndDate: false,
            enableCancellationPolicy: false,
            enableCurrencies: false,
            enableIndustries: false,
            enableWorldAreas: false,
            showInSidebar: true,
        },
        {
            id: "cryptocurrencies" as InvestmentTypeId,
            isPredefined: true,
            name: "cryptocurrencies" as InvestmentTypeName,
            slug: "cryptocurrencies" as InvestmentTypeSlug,
            icon: JSON.parse(JSON.stringify(faSolid.faBitcoinSign)),
            purchase: "decimalUnits",
            valueCalculationMethod: "cryptocurrency",
            enableInterest: false,
            enableEndDate: false,
            enableCancellationPolicy: false,
            enableCurrencies: false,
            enableIndustries: false,
            enableWorldAreas: false,
            showInSidebar: true,
        },
    ],
    loadingState: "not-loaded",
};

export const reservedInvestmentTypeSlugs = ["all", "create"] as InvestmentTypeSlug[];

export function createInvestmentTypeSlug(text: string): InvestmentTypeSlug {
    const slug = text
        .trim()
        .replace(/(\s)([a-z])/g, match => match.toUpperCase().trim())
        .replace(/[^a-zA-Z0-9_-]/g, "") as InvestmentTypeSlug;
    if (reservedInvestmentTypeSlugs.includes(slug)) {
        return `_${slug}` as InvestmentTypeSlug;
    }
    return slug;
}

export function getEmptyCustomInvestmentType(): InvestmentType {
    return {
        id: "" as InvestmentTypeId,
        isPredefined: false,
        name: "" as InvestmentTypeName,
        slug: "" as InvestmentTypeSlug,
        icon: JSON.parse(JSON.stringify(faSolid.faMoneyBill)),
        purchase: "anyAmountOfMoney",
        valueCalculationMethod: "manual",
        enableInterest: false,
        enableEndDate: true,
        enableCancellationPolicy: false,
        enableCurrencies: false,
        enableIndustries: false,
        enableWorldAreas: false,
        showInSidebar: true,
    };
}

const entryKey = "investment-types" as KvapiTypes.data.entry.Key;

export const loadInvestmentTypesAsync = createAsyncThunk(
    "investmentTypes/loadInvestmentTypes",
    async (api: Api) => {
        const response = await api.privateEntries.get(entryKey);
        return JSON.parse(response) as InvestmentTypesState;
    },
);

export const saveInvestmentTypesAsync = createAsyncThunk(
    "investmentTypes/saveInvestmentTypes",
    async (data: { investmentTypes: InvestmentTypesState, api: Api }) => {
        const entryValue = JSON.stringify(data.investmentTypes) as KvapiTypes.data.entry.Value;
        await data.api.privateEntries.set(entryKey, entryValue);
    },
);

export const addInvestmentTypeAsync = createAsyncThunk(
    "investmentTypes/addInvestmentType",
    async (data: { investmentType: InvestmentType, api: Api }) => {
        const investmentTypes = {...store.getState().investmentTypes};
        const investmentTypesList = [...investmentTypes.investmentsTypesList];
        investmentTypes.investmentsTypesList = investmentTypesList;
        let id: InvestmentTypeId | null = null;
        while (id === null) {
            id = Utils.randomString(12) as InvestmentTypeId;
            const _id = id;
            if (investmentTypesList.find(investmentType => investmentType.id === _id)) {
                id = null;
            }
        }
        investmentTypesList.push({
            ...data.investmentType,
            id,
        });
        const entryValue = JSON.stringify(investmentTypes) as KvapiTypes.data.entry.Value;
        await data.api.privateEntries.set(entryKey, entryValue);
        return investmentTypesList;
    },
);

export const removeInvestmentTypeAsync = createAsyncThunk(
    "investmentTypes/removeInvestmentType",
    async (data: { investmentTypeId: InvestmentTypeId, api: Api }) => {
        const investmentTypes = {...store.getState().investmentTypes};
        const investmentTypesList = [...investmentTypes.investmentsTypesList];
        investmentTypes.investmentsTypesList = investmentTypesList;
        const idx = investmentTypesList.findIndex(investmentType => investmentType.id === data.investmentTypeId);
        if (idx >= 0) {
            investmentTypesList.splice(idx, 1);
        }
        const entryValue = JSON.stringify(investmentTypes) as KvapiTypes.data.entry.Value;
        await data.api.privateEntries.set(entryKey, entryValue);
        return investmentTypesList;
    },
);

export const updateInvestmentTypeAsync = createAsyncThunk(
    "investmentTypes/updateInvestmentType",
    async (data: { investmentType: InvestmentType, api: Api }) => {
        const investmentTypes = {...store.getState().investmentTypes};
        const investmentTypesList = [...investmentTypes.investmentsTypesList];
        investmentTypes.investmentsTypesList = investmentTypesList;
        const idx = investmentTypesList.findIndex(investmentType => investmentType.id === data.investmentType.id);
        if (idx >= 0) {
            investmentTypesList[idx] = data.investmentType;
        }
        const entryValue = JSON.stringify(investmentTypes) as KvapiTypes.data.entry.Value;
        await data.api.privateEntries.set(entryKey, entryValue);
        return investmentTypesList;
    },
);

export const investmentTypesSlice = createSlice({
    name: "investments",
    initialState,
    reducers: {
        resetInvestmentTypes: () => {
            return initialState;
        },
        setInvestmentsTypes: (state, action: PayloadAction<InvestmentTypesState | null>) => {
            const data = action.payload ?? initialState;
            state.investmentsTypesList = data.investmentsTypesList;
            state.loadingState = data.loadingState;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loadInvestmentTypesAsync.fulfilled, (state, action) => {
                state.loadingState = "loaded";
                action.payload.investmentsTypesList.find(investmentType => investmentType.id === "marketInvestments")!.slug = "marketInvestments" as InvestmentTypeSlug;
                state.investmentsTypesList = action.payload.investmentsTypesList;
            })
            .addCase(loadInvestmentTypesAsync.pending, state => {
                state.loadingState = "loading";
            })
            .addCase(loadInvestmentTypesAsync.rejected, (state, action) => {
                if (action.error.message?.includes("404 Not Found")) {
                    state.loadingState = "failed-not-found";
                }
            })
            .addCase(addInvestmentTypeAsync.fulfilled, (state, action) => {
                state.loadingState = "loaded";
                state.investmentsTypesList = action.payload;
            })
            .addCase(removeInvestmentTypeAsync.fulfilled, (state, action) => {
                state.loadingState = "loaded";
                state.investmentsTypesList = action.payload;
            })
            .addCase(updateInvestmentTypeAsync.fulfilled, (state, action) => {
                state.loadingState = "loaded";
                state.investmentsTypesList = action.payload;
            });
    },
});

export const {
    resetInvestmentTypes,
    setInvestmentsTypes,
} = investmentTypesSlice.actions;

export const selectInvestmentTypes = (state: RootState) => state.investmentTypes;
export const selectInvestmentTypesList = (state: RootState) => state.investmentTypes.investmentsTypesList;
export const selectInvestmentTypesLoadingState = (state: RootState) => state.investmentTypes.loadingState;

export default investmentTypesSlice.reducer;
