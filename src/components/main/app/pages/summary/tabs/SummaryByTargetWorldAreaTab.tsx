import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";

import { useAppSelector, WorldAreaData, worldAreas } from "../../../../../../app/store";
import { selectExternalData } from "../../../../../../app/store/ExternalDataSlice";
import { InvestmentTargetWorldAreaId, selectInvestmentsList } from "../../../../../../app/store/InvestmentsSlice";
import { selectUserMainCurrencyId, selectUserSettings } from "../../../../../../app/store/UserSettingsSlice";
import { WalletId } from "../../../../../../app/store/WalletsSlice";
import * as WorldAreas from "../../../../../../app/store/WorldAreas";
import { Calculator } from "../../../../../../app/valueCalculation";
import { CurrencyConverter } from "../../../../../../app/valueCalculation/CurrencyConverter";
import { InvestmentEx } from "../Summary";
import { Entry, SummaryTableWithChart } from "../summaryTableWithChart/SummaryTableWithChart";

export interface SummaryByTargetWorldAreaTabProps {
    includedWallets: WalletId[];
    investmentsEx: InvestmentEx[];
}

type CombinedWorldAreasStrategy = "showSeparate" | "distributeEvenly" | "exclude";

function getCombinedWorldAreasStrategies(): CombinedWorldAreasStrategy[] {
    return ["showSeparate", "distributeEvenly", "exclude"];
}

interface RawEntry {
    worldArea: WorldAreaData;
    entry: Entry;
}

export function SummaryByTargetWorldAreaTab(props: SummaryByTargetWorldAreaTabProps) {
    const { t } = useTranslation();
    const mainCurrencyId = useAppSelector(selectUserMainCurrencyId);
    const investments = useAppSelector(selectInvestmentsList);
    const externalData = useAppSelector(selectExternalData);
    const userSettings = useAppSelector(selectUserSettings);
    const [wholeWorldStrategy, setWholeWorldStrategy] = useState<CombinedWorldAreasStrategy>("showSeparate");
    const [continentsStrategy, setContinentsStrategy] = useState<CombinedWorldAreasStrategy>("showSeparate");
    
    const includedWallets = props.includedWallets;
    
    const handleWholeWorldStrategyChange = (strategy: CombinedWorldAreasStrategy) => {
        setWholeWorldStrategy(strategy);
    };
    
    const handleContinentsStrategyChange = (strategy: CombinedWorldAreasStrategy) => {
        setContinentsStrategy(strategy);
    };
    
    const worldAreaIds = useMemo(() => {
        const worldAreaIds = new Set();
        for (const investment of investments) {
            for (const targetWorldArea of investment.targetWorldAreas) {
                worldAreaIds.add(targetWorldArea.id);
            }
        }
        return [...worldAreaIds] as InvestmentTargetWorldAreaId[];
    }, [investments]);
    
    const rawEntries: RawEntry[] = useMemo(() => {
        return worldAreaIds.map(worldAreaId => {
            const value = investments
                .map(investment => {
                    if (!includedWallets.includes(investment.walletId)) {
                        return 0;
                    }
                    const target = investment.targetWorldAreas.find(targetWorldArea => targetWorldArea.id === worldAreaId);
                    if (!target) {
                        return 0;
                    }
                    const targetShare = target.percentage / 100;
                    const value = new Calculator(investment, externalData, userSettings).calculate() * targetShare;
                    return CurrencyConverter.convert(value, investment.purchase.currency, userSettings.mainCurrencyId, externalData);
                })
                .reduce((sum, value) => sum + value, 0);
            const worldArea = worldAreas[worldAreaId];
            if (!worldArea) {
                return null;
            }
            const worldAreaName = worldAreas[worldAreaId].name ?? worldAreaId;
            return {
                worldArea,
                entry: {
                    id: worldAreaId,
                    title: `${worldAreaName}`,
                    value,
                },
            };
        }).filter(entry => !!entry) as RawEntry[];
    }, [investments, externalData, userSettings, includedWallets, worldAreaIds]);
    
    const entries: Entry[] = useMemo(() => {
        const entries: Entry[] = [];
        
        const allCountries = Object.values(WorldAreas.countries);
        
        const rawEntries2 = JSON.parse(JSON.stringify(rawEntries)) as RawEntry[];
        const worldEntries = rawEntries2.filter(entry => entry.worldArea.type === "world");
        const continentEntries = rawEntries2.filter(entry => entry.worldArea.type === "continent");
        const countryEntries = rawEntries2.filter(entry => entry.worldArea.type === "country");
        
        entries.push(...countryEntries.map(rawEntry => rawEntry.entry));
        
        const addOrUpdateEntries = (countries: WorldAreaData[], singleAreaValue: number) => {
            for (const country of countries) {
                const entry = entries.find(entry => entry.id === country.key);
                if (entry) {
                    entry.value += singleAreaValue;
                }
                else {
                    entries.push({
                        id: country.key,
                        title: country.name,
                        value: singleAreaValue,
                    });
                }
            }
        };
        
        if (wholeWorldStrategy === "showSeparate") {
            entries.push(...worldEntries.map(rawEntry => rawEntry.entry));
        }
        else if (wholeWorldStrategy === "distributeEvenly") {
            for (const worldEntry of worldEntries) {
                const totalValue = worldEntry.entry.value;
                const numCountries = allCountries.length;
                const singleAreaValue = totalValue / numCountries;
                addOrUpdateEntries(allCountries, singleAreaValue);
            }
        }
        
        if (continentsStrategy === "showSeparate") {
            entries.push(...continentEntries.map(rawEntry => rawEntry.entry));
        }
        else if (continentsStrategy === "distributeEvenly") {
            for (const continentEntry of continentEntries) {
                const subAreas = (continentEntry.worldArea.subAreas ?? []).map(subArea => allCountries.find(country => country.key === subArea)!);
                const totalValue = continentEntry.entry.value;
                const numCountries = subAreas.length;
                const singleAreaValue = totalValue / numCountries;
                addOrUpdateEntries(subAreas, singleAreaValue);
            }
        }
        
        return entries;
    }, [rawEntries, wholeWorldStrategy, continentsStrategy]);
    
    return (
        <div className="SummaryByTargetWorldAreaTab">
            <div className="SummaryByTargetWorldAreaTab__settings">
                <FormControl>
                    <InputLabel id="summary-worldAreas-whole-world-strategy-label">{t("page.summary.worldAreas.combinedWorldAreasStrategies.wholeWorld")}</InputLabel>
                    <Select
                        label={t("page.summary.worldAreas.combinedWorldAreasStrategies.wholeWorld")}
                        labelId="summary-worldAreas-whole-world-strategy-label"
                        value={wholeWorldStrategy}
                        onChange={event => handleWholeWorldStrategyChange(event.target.value as CombinedWorldAreasStrategy)}
                    >
                        {getCombinedWorldAreasStrategies().map(strategy => (
                            <MenuItem key={strategy} value={strategy}>
                                {t(`page.summary.worldAreas.combinedWorldAreasStrategies.${strategy}`)}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl>
                    <InputLabel id="summary-worldAreas-continents-strategy-label">{t("page.summary.worldAreas.combinedWorldAreasStrategies.continents")}</InputLabel>
                    <Select
                        label={t("page.summary.worldAreas.combinedWorldAreasStrategies.continents")}
                        labelId="summary-worldAreas-continents-strategy-label"
                        value={continentsStrategy}
                        onChange={event => handleContinentsStrategyChange(event.target.value as CombinedWorldAreasStrategy)}
                    >
                        {getCombinedWorldAreasStrategies().map(strategy => (
                            <MenuItem key={strategy} value={strategy}>
                                {t(`page.summary.worldAreas.combinedWorldAreasStrategies.${strategy}`)}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </div>
            <SummaryTableWithChart
                includedWallets={props.includedWallets}
                investmentsEx={props.investmentsEx}
                entries={entries}
                mainCurrencyId={mainCurrencyId}
                withWorldMap={true}
            />
        </div>
    );
}
