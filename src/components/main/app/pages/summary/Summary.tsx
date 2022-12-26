import "./Summary.scss";

import * as faSolid from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Checkbox from "@mui/material/Checkbox";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { useAppSelector } from "../../../../../app/store";
import { selectExternalData } from "../../../../../app/store/ExternalDataSlice";
import { Investment, selectInvestmentsList } from "../../../../../app/store/InvestmentsSlice";
import { selectUserSettings } from "../../../../../app/store/UserSettingsSlice";
import { selectWalletsList, WalletId } from "../../../../../app/store/WalletsSlice";
import { Calculator } from "../../../../../app/valueCalculation";
import { CurrencyConverter } from "../../../../../app/valueCalculation/CurrencyConverter";
import { Page } from "../../page/Page";
import { PageContent } from "../../pageContent/PageContent";
import { PageHeader } from "../../pageHeader/PageHeader";
import { SummaryByInvestmentTypeTab } from "./tabs/SummaryByInvestmentTypeTab";
import { SummaryByPurchaseCurrencyTab } from "./tabs/SummaryByPurchaseCurrencyTab";
import { SummaryByTargetCurrencyTab } from "./tabs/SummaryByTargetCurrencyTab";
import { SummaryByTargetIndustryTab } from "./tabs/SummaryByTargetIndustryTab";
import { SummaryByTargetWorldAreaTab } from "./tabs/SummaryByTargetWorldAreaTab";
import { SummaryByWalletTab } from "./tabs/SummaryByWalletTab";





export interface InvestmentEx extends Investment {
    currentValue: number;
    currentValueInMainCurrency: number;
}

type TabId = "byWallet" | "byInvestmentType" | "byPurchaseCurrency" | "byTargetCurrency" | "byTargetIndustry" | "byTargetWorldArea";

export function Summary() {
    const { t } = useTranslation();
    const externalData = useAppSelector(selectExternalData);
    const userSettings = useAppSelector(selectUserSettings);
    const wallets = useAppSelector(selectWalletsList);
    const investments = useAppSelector(selectInvestmentsList);
    const [includedWalletIds, setIncludedWalletIds] = useState(wallets.map(wallet => wallet.id));
    const [activeTabId, setActiveTabId] = useState<TabId>("byWallet");
    
    const investmentsEx = useMemo(() => {
        return investments.map(investment => {
            const currentValue = new Calculator(investment, externalData, userSettings).calculate();
            const currentValueInMainCurrency = CurrencyConverter.convert(currentValue, investment.purchase.currency, userSettings.mainCurrencyId, externalData);
            return {
                ...investment,
                currentValue,
                currentValueInMainCurrency,
            } as InvestmentEx;
        });
    }, [investments, externalData, userSettings]);
    
    const handleActiveWalletsChange = (value: WalletId[]) => {
        setIncludedWalletIds(value);
    };
    
    const handleActiveTabIdChange = (value: TabId) => {
        setActiveTabId(value);
    };
    
    return (
        <Page className="Summary">
            <PageHeader title={t("page.summary")} icon={<FontAwesomeIcon icon={faSolid.faChartPie} />} />
            <PageContent>
                <Tabs
                    value={activeTabId}
                    variant="scrollable"
                    scrollButtons="auto"
                    onChange={(_, value) => handleActiveTabIdChange(value)}
                    className="Summary__tabs"
                >
                    <Tab value="byWallet" label={t("page.summary.tabs.byWallet")} icon={<FontAwesomeIcon icon={faSolid.faWallet} />} />
                    <Tab value="byInvestmentType" label={t("page.summary.tabs.byInvestmentType")} icon={<FontAwesomeIcon icon={faSolid.faFolder} />} />
                    <Tab value="byPurchaseCurrency" label={t("page.summary.tabs.byPurchaseCurrency")} icon={<FontAwesomeIcon icon={faSolid.faShoppingBasket} />} />
                    <Tab value="byTargetCurrency" label={t("page.summary.tabs.byTargetCurrency")} icon={<FontAwesomeIcon icon={faSolid.faDollarSign} />} />
                    <Tab value="byTargetIndustry" label={t("page.summary.tabs.byTargetIndustry")} icon={<FontAwesomeIcon icon={faSolid.faIndustry} />} />
                    <Tab value="byTargetWorldArea" label={t("page.summary.tabs.byTargetWorldArea")} icon={<FontAwesomeIcon icon={faSolid.faGlobeAfrica} />} />
                </Tabs>
                {activeTabId !== "byWallet" && <div className="Summary__view-settings">
                    <FormControl>
                        <InputLabel id="summary-wallets-filter-label">{t("page.summary.filters.wallets.title")}</InputLabel>
                        <Select
                            label={t("page.summary.filters.wallets.title")}
                            labelId="summary-wallets-filter-label"
                            value={includedWalletIds}
                            multiple
                            renderValue={walletIds => wallets.filter(wallet => walletIds.includes(wallet.id)).map(wallet => (wallet.isPredefined ? t(wallet.name as any) : wallet.name)).join(", ")}
                            onChange={event => handleActiveWalletsChange(event.target.value as WalletId[])}
                        >
                            {wallets.map(filter => (
                                <MenuItem key={filter.id} value={filter.id}>
                                    <Checkbox checked={includedWalletIds.includes(filter.id)} />
                                    <ListItemText>{filter.isPredefined ? t(filter.name as any) : filter.name}</ListItemText>
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </div>}
                {activeTabId === "byWallet" && <SummaryByWalletTab includedWallets={includedWalletIds} investmentsEx={investmentsEx} />}
                {activeTabId === "byInvestmentType" && <SummaryByInvestmentTypeTab includedWallets={includedWalletIds} investmentsEx={investmentsEx} />}
                {activeTabId === "byPurchaseCurrency" && <SummaryByPurchaseCurrencyTab includedWallets={includedWalletIds} investmentsEx={investmentsEx} />}
                {activeTabId === "byTargetCurrency" && <SummaryByTargetCurrencyTab includedWallets={includedWalletIds} investmentsEx={investmentsEx} />}
                {activeTabId === "byTargetIndustry" && <SummaryByTargetIndustryTab includedWallets={includedWalletIds} investmentsEx={investmentsEx} />}
                {activeTabId === "byTargetWorldArea" && <SummaryByTargetWorldAreaTab includedWallets={includedWalletIds} investmentsEx={investmentsEx} />}
            </PageContent>
        </Page>
    );
}
