import * as WalletsTypes from "@wpazderski/wallets-types";
import { useTranslation } from "react-i18next";

import { useAppSelector } from "../../../../../../../app/store";
import {
    selectCryptocurrencies,
    selectCryptocurrencyExchangeRates,
    selectExternalData,
} from "../../../../../../../app/store/ExternalDataSlice";
import {
    Investment,
    InvestmentValueCalculationMethod_Cryptocurrency,
} from "../../../../../../../app/store/InvestmentsSlice";
import { selectUserMainCurrencyId } from "../../../../../../../app/store/UserSettingsSlice";
import { CurrencyConverter } from "../../../../../../../app/valueCalculation/CurrencyConverter";
import { FormField } from "../../../../../common/formField/FormField";
import { NumberView } from "../../../../../common/numberView/NumberView";





export interface InvestmentValueCalculationMethodViewProps {
    investment: Investment;
}

export function InvestmentValueCalculationMethodView(props: InvestmentValueCalculationMethodViewProps) {
    const { t } = useTranslation();
    
    return (
        <FormField title={t("common.investments.fields.valueCalculationMethod")} className="FormField--full-width">
            {props.investment.valueCalculationMethod.type === "manual" && (
                <>
                    {t("common.investments.fields.valueCalculationMethod.type.manual")}{": "}
                    <NumberView num={props.investment.valueCalculationMethod.currentValue} currency={props.investment.purchase.currency} />
                </>
            )}
            {props.investment.valueCalculationMethod.type === "interest" && (
                <>
                    {t("common.investments.fields.valueCalculationMethod.type.interest")}
                </>
            )}
            {props.investment.valueCalculationMethod.type === "obtainer" && (
                <>
                    <div>
                        {t("common.investments.fields.valueCalculationMethod.type.obtainer")}:
                    </div>
                    <div>
                        <a href={"https://finance.yahoo.com/chart/" + props.investment.valueCalculationMethod.ticker} target="_blank" rel="noreferrer">https://finance.yahoo.com/chart/{props.investment.valueCalculationMethod.ticker}</a>
                    </div>
                </>
            )}
            {props.investment.valueCalculationMethod.type === "cryptocurrency" && (
                <>
                    <div>
                        {t("common.investments.fields.valueCalculationMethod.type.cryptocurrency")}:
                    </div>
                    <div>
                        <CryptocurrencyValueCalculationDetails valueCalculationMethod={props.investment.valueCalculationMethod} />
                    </div>
                </>
            )}
        </FormField>
    );
}

interface CryptocurrencyValueCalculationDetailsProps {
    valueCalculationMethod: InvestmentValueCalculationMethod_Cryptocurrency;
}

function CryptocurrencyValueCalculationDetails(props: CryptocurrencyValueCalculationDetailsProps) {
    const externalData = useAppSelector(selectExternalData);
    const userMainCurrencyId = useAppSelector(selectUserMainCurrencyId);
    const cryptocurrencies = useAppSelector(selectCryptocurrencies);
    const cryptocurrencyExchangeRates = useAppSelector(selectCryptocurrencyExchangeRates);
    
    const cryptocurrencyId = props.valueCalculationMethod.cryptocurrencyId;
    const cryptocurrencyName = cryptocurrencies.find(cc => cc.id === cryptocurrencyId)?.name ?? "";
    const cryptocurrencyExchangeRate = cryptocurrencyExchangeRates[cryptocurrencyId] ?? 0;
    const cryptocurrencyExchangeRateConverted = CurrencyConverter.convert(cryptocurrencyExchangeRate, "EUR" as WalletsTypes.data.currency.Id, userMainCurrencyId, externalData);
    
    return (
        <div className="math-equation">
            {props.valueCalculationMethod.cryptocurrencyId in cryptocurrencyExchangeRates && (
                <>
                    {cryptocurrencyName}
                    {" ("}
                    <NumberView num={1.00} currency={cryptocurrencyId} />
                    {" = "}
                    <NumberView num={cryptocurrencyExchangeRate} currency={"EUR"} />
                    {" = "}
                    <NumberView num={cryptocurrencyExchangeRateConverted} currency={userMainCurrencyId} />
                    {")"}
                </>
            )}
        </div>
    );
}
