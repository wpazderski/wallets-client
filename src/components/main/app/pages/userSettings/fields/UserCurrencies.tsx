import { useState } from "react";
import { useTranslation } from "react-i18next";

import * as faSolid from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import * as WalletsTypes from "@wpazderski/wallets-types";

import { useAppSelector } from "../../../../../../app/store";
import { selectCurrencies } from "../../../../../../app/store/ExternalDataSlice";
import { UserSettingsState } from "../../../../../../app/store/UserSettingsSlice";
import { FormField } from "../../../../common/formField/FormField";

export interface UserCurrenciesProps {
    currencies: WalletsTypes.data.currency.Currency[];
    mainCurrencyId: WalletsTypes.data.currency.Id;
    updateSettings: (updater: (settings: UserSettingsState) => void) => Promise<void>;
}

export function UserCurrencies(props: UserCurrenciesProps) {
    const { t } = useTranslation();
    const availableCurrencies = useAppSelector(selectCurrencies);
    const [selectedNewCurrency, setSelectedNewCurrency] = useState(availableCurrencies.length > 0 ? availableCurrencies[0].id : "");
    
    const handleDeleteCurrencyClick = (currencyId: WalletsTypes.data.currency.Id) => {
        if (props.currencies.length < 2) {
            return;
        }
        props.updateSettings(settings => {
            settings.currencies = settings.currencies.filter(currency => currency.id !== currencyId);
            if (settings.mainCurrencyId === currencyId) {
                settings.mainCurrencyId = settings.currencies.length > 0 ? settings.currencies[0].id : "" as WalletsTypes.data.currency.Id;
            }
        });
    };
    
    const handleSetCurrencyAsPrimaryClick = (currencyId: WalletsTypes.data.currency.Id) => {
        props.updateSettings(settings => {
            settings.mainCurrencyId = currencyId;
        });
    };
    
    const handleSelectedNewCurrencyChange = (value: WalletsTypes.data.currency.Id) => {
        setSelectedNewCurrency(value);
    };
    
    const handleAddCurrencyClick = () => {
        props.updateSettings(settings => {
            const newCurrency = availableCurrencies.find(currency => currency.id === selectedNewCurrency);
            if (!newCurrency) {
                return;
            }
            settings.currencies.push(newCurrency);
            const notAddedCurrencies = availableCurrencies.filter(currency => !settings.currencies.find(item => item.id === currency.id)); 
            setSelectedNewCurrency(notAddedCurrencies.length > 0 ? notAddedCurrencies[0].id : "");
        });
    };
    
    return (
        <FormField className="UserSettings__Currencies" title={t("page.userSettings.form.currencies.name")} description={t("page.userSettings.form.currencies.description")}>
            <div>
                <table className="unstyled">
                    <colgroup>
                        <col style={{ width: "10%", whiteSpace: "nowrap" }} />
                        <col style={{ width: "70%" }} />
                        <col style={{ width: "20%" }} />
                    </colgroup>
                    <thead>
                        <tr>
                            <th>{t("page.userSettings.form.currencies.list.main")}</th>
                            <th>{t("page.userSettings.form.currencies.list.currency")}</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {props.currencies.map(currency => (
                            <tr key={`currency-${currency.id}`}>
                                <td>
                                    <Button variant={props.mainCurrencyId === currency.id ? "contained" : "outlined"} size="small" onClick={() => handleSetCurrencyAsPrimaryClick(currency.id)} sx={{ height: 30, minWidth: 40 }}>
                                        <FontAwesomeIcon icon={props.mainCurrencyId === currency.id ? faSolid.faCheck : faSolid.faTimes} fixedWidth={true} />
                                    </Button>
                                </td>
                                <td>{currency.id} <small>({currency.name})</small></td>
                                <td>
                                    <Button variant="text" size="small" onClick={() => handleDeleteCurrencyClick(currency.id)} disabled={props.currencies.length < 2} sx={{ height: 30, minWidth: 40 }}>
                                        <FontAwesomeIcon icon={faSolid.faTrash} fixedWidth={true} />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        <tr>
                            <td colSpan={2}>
                                <FormControl size="small">
                                    <Select
                                        sx={{ width: 370 }}
                                        value={selectedNewCurrency}
                                        onChange={event => handleSelectedNewCurrencyChange(event.target.value as WalletsTypes.data.currency.Id)}
                                    >
                                        {
                                            availableCurrencies
                                                .filter(currency => !props.currencies.find(item => item.id === currency.id))
                                                .map(currency => (
                                                    <MenuItem key={currency.id} value={currency.id}>{currency.id} ({currency.name})</MenuItem>
                                                ))
                                        }
                                    </Select>
                                </FormControl>
                            </td>
                            <td>
                                <Button variant="contained" size="small" onClick={handleAddCurrencyClick} sx={{ height: 38, minWidth: 50 }}>
                                    <FontAwesomeIcon icon={faSolid.faPlus} fixedWidth={true} />
                                </Button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </FormField>
    );
}
