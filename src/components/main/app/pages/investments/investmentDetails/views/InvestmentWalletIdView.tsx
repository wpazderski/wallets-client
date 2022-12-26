import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { useAppSelector } from "../../../../../../../app/store";
import { Investment } from "../../../../../../../app/store/InvestmentsSlice";
import { selectWalletsList } from "../../../../../../../app/store/WalletsSlice";
import { FormField } from "../../../../../common/formField/FormField";
import { getViewWalletUrl } from "../../../wallets/Wallets";





export interface InvestmentWalletIdViewProps {
    investment: Investment;
}

export function InvestmentWalletIdView(props: InvestmentWalletIdViewProps) {
    const { t } = useTranslation();
    const wallets = useAppSelector(selectWalletsList);
    const wallet = wallets.find(wallet => wallet.id === props.investment.walletId);
    
    return (
        <FormField title={t("common.investments.fields.walletId")} className="FormField--full-width">
            {wallet && (
                <Link to={getViewWalletUrl(wallet.id)}>
                    {wallet.isPredefined ? t(wallet.name as any) : wallet.name}
                </Link>
            )}
            {!wallet && (
                <>
                    {t("common.wallets.error.doesNotExist")}
                </>
            )}
        </FormField>
    );
}
