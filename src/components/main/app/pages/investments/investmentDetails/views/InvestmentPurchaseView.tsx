import { useTranslation } from "react-i18next";

import { Investment } from "../../../../../../../app/store/InvestmentsSlice";
import { FormField } from "../../../../../common/formField/FormField";
import { NumberView } from "../../../../../common/numberView/NumberView";





export interface InvestmentPurchaseViewProps {
    investment: Investment;
}

export function InvestmentPurchaseView(props: InvestmentPurchaseViewProps) {
    const { t } = useTranslation();
    
    return (
        <FormField title={t("common.investments.fields.purchase")} className="FormField--full-width">
            {props.investment.purchase.type === "anyAmountOfMoney" && (
                <NumberView num={props.investment.purchase.amountOfMoney} currency={props.investment.purchase.currency} />
            )}
            {(props.investment.purchase.type === "decimalUnits" || props.investment.purchase.type === "integerUnits") && (
                <div className="math-equation">
                    <NumberView
                        className="math-equation__number math-equation__number-currency"
                        num={props.investment.purchase.unitPrice * props.investment.purchase.numUnits}
                        currency={props.investment.purchase.currency}
                    />
                    <span className="math-equation__operator">=</span>
                    <NumberView
                        className="math-equation__number"
                        num={props.investment.purchase.numUnits}
                        precision={props.investment.purchase.type === "integerUnits" ? 0 : 9}
                    />
                    <span className="math-equation__operator">x</span>
                    <NumberView
                        className="math-equation__number math-equation__number-currency"
                        num={props.investment.purchase.unitPrice}
                        currency={props.investment.purchase.currency}
                    />
                </div>
            )}
            {props.investment.purchase.type === "weight" && (
                <div className="math-equation">
                    <NumberView
                        className="math-equation__number math-equation__number-currency"
                        num={props.investment.purchase.price * props.investment.purchase.weight}
                        currency={props.investment.purchase.currency}
                    />
                    <span className="math-equation__operator">=</span>
                    <NumberView
                        className="math-equation__number math-equation__number-unit"
                        num={props.investment.purchase.weight}
                        currency={props.investment.purchase.unit}
                        precision={9}
                    />
                    <span className="math-equation__operator">x</span>
                    <NumberView
                        className="math-equation__number math-equation__number-currency"
                        num={props.investment.purchase.price}
                        currency={props.investment.purchase.currency}
                    />
                </div>
            )}
        </FormField>
    );
}
