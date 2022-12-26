import * as WalletsTypes from "@wpazderski/wallets-types";

import { ExternalDataState } from "../store/ExternalDataSlice";





export class CurrencyConverter {
    
    static convert(
        value: number,
        valueCurrency: WalletsTypes.data.currency.Id,
        targetCurrency: WalletsTypes.data.currency.Id,
        externalData: ExternalDataState,
    ) {
        const currencyToEur = 1 / externalData.exchangeRates[valueCurrency];
        const eurToMainCurrency = externalData.exchangeRates[targetCurrency];
        const currencyToMainCurrency = currencyToEur * eurToMainCurrency;
        return value * currencyToMainCurrency;
    }
    
}
