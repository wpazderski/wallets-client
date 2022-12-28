import * as faSolid from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import * as WalletsTypes from "@wpazderski/wallets-types";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

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
    const updateSettings = props.updateSettings;
    
    const { t } = useTranslation();
    const availableCurrencies = useAppSelector(selectCurrencies);
    const [selectedNewCurrency, setSelectedNewCurrency] = useState(availableCurrencies.length > 0 ? availableCurrencies[0].id : "" as WalletsTypes.data.currency.Id);
    
    const handleDeleteCurrencyClick = useCallback((currencyId: WalletsTypes.data.currency.Id) => {
        if (props.currencies.length < 2) {
            return;
        }
        updateSettings(settings => {
            settings.currencies = settings.currencies.filter(currency => currency.id !== currencyId);
            if (settings.mainCurrencyId === currencyId) {
                settings.mainCurrencyId = settings.currencies.length > 0 ? settings.currencies[0].id : "" as WalletsTypes.data.currency.Id;
            }
        });
    }, [props.currencies.length, updateSettings]);
    
    const handleSetCurrencyAsPrimaryClick = useCallback((currencyId: WalletsTypes.data.currency.Id) => {
        updateSettings(settings => {
            settings.mainCurrencyId = currencyId;
        });
    }, [updateSettings]);
    
    const handleSelectedNewCurrencyChange = useCallback((event: SelectChangeEvent<WalletsTypes.data.currency.Id>) => {
        setSelectedNewCurrency(event.target.value as WalletsTypes.data.currency.Id);
    }, []);
    
    const handleAddCurrencyClick = useCallback(() => {
        updateSettings(settings => {
            const newCurrency = availableCurrencies.find(currency => currency.id === selectedNewCurrency);
            if (!newCurrency) {
                return;
            }
            settings.currencies.push(newCurrency);
            const notAddedCurrencies = availableCurrencies.filter(currency => !settings.currencies.find(item => item.id === currency.id)); 
            setSelectedNewCurrency(notAddedCurrencies.length > 0 ? notAddedCurrencies[0].id : "" as WalletsTypes.data.currency.Id);
        });
    }, [availableCurrencies, selectedNewCurrency, updateSettings]);
    
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
                                    <SetCurrencyAsPrimaryButton mainCurrencyId={props.mainCurrencyId} currencyId={currency.id} onSetCurrencyAsPrimaryClick={handleSetCurrencyAsPrimaryClick} />
                                </td>
                                <td>{currency.id} <small>({currency.name})</small></td>
                                <td>
                                    <DeleteCurrencyButton currencies={props.currencies} currencyId={currency.id} onDeleteCurrencyClick={handleDeleteCurrencyClick} />
                                </td>
                            </tr>
                        ))}
                        <tr>
                            <td colSpan={2}>
                                <FormControl size="small">
                                    <Select
                                        sx={{ width: 370 }}
                                        value={selectedNewCurrency}
                                        onChange={handleSelectedNewCurrencyChange}
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

interface SetCurrencyAsPrimaryButtonProps {
    mainCurrencyId: WalletsTypes.data.currency.Id;
    currencyId: WalletsTypes.data.currency.Id;
    onSetCurrencyAsPrimaryClick: (currencyId: WalletsTypes.data.currency.Id) => void;
}

function SetCurrencyAsPrimaryButton(props: SetCurrencyAsPrimaryButtonProps) {
    const onSetCurrencyAsPrimaryClick = props.onSetCurrencyAsPrimaryClick;
    
    const handleSetCurrencyAsPrimaryClick = useCallback(() => {
        onSetCurrencyAsPrimaryClick(props.currencyId);
    }, [onSetCurrencyAsPrimaryClick, props.currencyId]);
    
    return (
        <Button variant={props.mainCurrencyId === props.currencyId ? "contained" : "outlined"} size="small" onClick={handleSetCurrencyAsPrimaryClick} sx={{ height: 30, minWidth: 40 }}>
            <FontAwesomeIcon icon={props.mainCurrencyId === props.currencyId ? faSolid.faCheck : faSolid.faTimes} fixedWidth={true} />
        </Button>
    );
}

interface DeleteCurrencyButtonProps {
    currencies: WalletsTypes.data.currency.Currency[];
    currencyId: WalletsTypes.data.currency.Id;
    onDeleteCurrencyClick: (currencyId: WalletsTypes.data.currency.Id) => void;
}

function DeleteCurrencyButton(props: DeleteCurrencyButtonProps) {
    const onDeleteCurrencyClick = props.onDeleteCurrencyClick;
    
    const handleDeleteCurrencyClick = useCallback(() => {
        onDeleteCurrencyClick(props.currencyId);
    }, [onDeleteCurrencyClick, props.currencyId]);
    
    return (
        <Button variant="text" size="small" onClick={handleDeleteCurrencyClick} disabled={props.currencies.length < 2} sx={{ height: 30, minWidth: 40 }}>
            <FontAwesomeIcon icon={faSolid.faTrash} fixedWidth={true} />
        </Button>
    );
}
