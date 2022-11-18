import "./WalletDetails.scss";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useParams } from "react-router-dom";

import * as faSolid from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";

import { useAppSelector } from "../../../../../../app/store";
import { selectExternalData } from "../../../../../../app/store/ExternalDataSlice";
import { Investment, selectInvestmentsList } from "../../../../../../app/store/InvestmentsSlice";
import { InvestmentTypeSlug, selectInvestmentTypesList } from "../../../../../../app/store/InvestmentTypesSlice";
import { selectUserSettings } from "../../../../../../app/store/UserSettingsSlice";
import { selectWalletsList, WalletId } from "../../../../../../app/store/WalletsSlice";
import { Calculator } from "../../../../../../app/valueCalculation";
import { NumberView } from "../../../../common/numberView/NumberView";
import { Page } from "../../../page/Page";
import { PageContent } from "../../../pageContent/PageContent";
import { PageHeader } from "../../../pageHeader/PageHeader";
import { getEditInvestmentUrl, getViewInvestmentUrl } from "../../investments/Investments";

interface InvestmentEx extends Investment {
    currentValue: number;
}

export function WalletDetails() {
    const { walletId } = useParams() as { walletId: WalletId };
    const { t } = useTranslation();
    const navigate = useNavigate();
    const externalData = useAppSelector(selectExternalData);
    const userSettings = useAppSelector(selectUserSettings);
    const wallet = useAppSelector(selectWalletsList).find(wallet => wallet.id === walletId);
    const investmentTypes = useAppSelector(selectInvestmentTypesList);
    const investments = useAppSelector(selectInvestmentsList).filter(investment => investment.walletId === walletId);
    
    const investmentTypesSlugs = useMemo(() => {
        const obj: { [key: string]: InvestmentTypeSlug } = {};
        for (const investmentType of investmentTypes) {
            obj[investmentType.id] = investmentType.slug;
        }
        return obj;
    }, [investmentTypes]);
    
    const handleEditInvestmentClick = (investment: Investment) => {
        const slug = investmentTypesSlugs[investment.type];
        if (!slug) {
            return;
        }
        navigate(getEditInvestmentUrl(slug, investment.id));
    };
    
    const investmentsEx = useMemo(() => {
        return investments.map(investment => ({
            ...investment,
            currentValue: new Calculator(investment, externalData, userSettings).calculate(),
        })) as InvestmentEx[];
    }, [investments, externalData, userSettings]);
    
    return (
        <Page className="WalletDetails">
            <PageHeader
                title={wallet ? (wallet.isPredefined ? t(wallet.name as any) : wallet.name) : ""}
                icon={<FontAwesomeIcon icon={faSolid.faWallet} />}
            />
            <PageContent>
                {wallet && (
                    <>
                        {investmentsEx.length > 0 && (
                            <table>
                                <colgroup>
                                    <col width="100px" />
                                    <col />
                                    <col width="200px" />
                                    <col width="150px" />
                                </colgroup>
                                <thead>
                                    <tr>
                                        <th className="centered">#</th>
                                        <th className="left">{t("page.walletDetails.table.investmentName")}</th>
                                        <th className="left">{t("page.walletDetails.table.investmentsValue")}</th>
                                        <th className="centered">{t("page.walletDetails.table.investmentActions")}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {investmentsEx.map((investment, idx) => (
                                        <tr key={investment.id}>
                                            <td className="centered">{idx + 1}</td>
                                            <td>
                                                {investmentTypesSlugs[investment.type] && (
                                                    <Link to={getViewInvestmentUrl(investmentTypesSlugs[investment.type], investment.id)}>
                                                        {investment.name}
                                                    </Link>
                                                )}
                                                {!investmentTypesSlugs[investment.type] &&
                                                    investment.name
                                                }
                                            </td>
                                            <td className="right">
                                                <NumberView num={investment.currentValue} currency={investment.purchase.currency} />
                                            </td>
                                            <td className="centered">
                                                {investmentTypesSlugs[investment.type] && (
                                                    <Button
                                                        variant="contained"
                                                        onClick={() => handleEditInvestmentClick(investment)}
                                                        sx={{ minWidth: 45, padding: 1.5 }}
                                                    >
                                                        <FontAwesomeIcon icon={faSolid.faPen} />
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                        {investments.length === 0 && (
                            <div>
                                {t("common.wallets.info.emptyWallet")}
                            </div>
                        )}
                    </>
                )}
                {!true && (
                    <Alert
                        severity="error"
                        variant="filled"
                    >
                        {t("common.wallets.error.doesNotExist")}
                    </Alert>
                )}
            </PageContent>
        </Page>
    );
}
