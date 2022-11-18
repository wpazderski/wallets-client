import { Action, configureStore, ThunkAction } from "@reduxjs/toolkit";

import appInfoReducer from "./AppInfoSlice";
import appReducer from "./AppSlice";
import externalDataReducer from "./ExternalDataSlice";
import investmentsReducer from "./InvestmentsSlice";
import investmentTypesReducer from "./InvestmentTypesSlice";
import userSettingsReducer from "./UserSettingsSlice";
import userReducer from "./UserSlice";
import usersReducer from "./UsersSlice";
import walletsReducer from "./WalletsSlice";

export const store = configureStore({
    reducer: {
        appInfo: appInfoReducer,
        app: appReducer,
        externalData: externalDataReducer,
        investments: investmentsReducer,
        investmentTypes: investmentTypesReducer,
        userSettings: userSettingsReducer,
        user: userReducer,
        users: usersReducer,
        wallets: walletsReducer,
    },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
    ReturnType,
    RootState,
    unknown,
    Action<string>
>;
