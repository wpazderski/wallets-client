import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";

import { getAvailableLangs } from "../../../../../../app/i18n";
import { Lang as LangType, UserSettingsState } from "../../../../../../app/store/UserSettingsSlice";
import { FormField } from "../../../../common/formField/FormField";





export interface UserLangProps {
    lang: LangType;
    updateSettings: (updater: (settings: UserSettingsState) => void) => Promise<void>;
}

export function UserLang(props: UserLangProps) {
    const updateSettings = props.updateSettings;
    
    const { t, i18n } = useTranslation();
    
    const handleLangChange = useCallback((event: SelectChangeEvent<LangType>) => {
        const value = event.target.value as LangType;
        updateSettings(settings => {
            settings.lang = value;
        })
        .then(() => {
            i18n.changeLanguage(value);
        });
    }, [i18n, updateSettings]);
    
    return (
        <FormField className="UserSettings__Lang" title={t("page.userSettings.form.lang.name")} description={t("page.userSettings.form.lang.description")}>
            <FormControl size="small">
                <Select
                    value={props.lang}
                    onChange={handleLangChange}
                >
                    {getAvailableLangs().map(langInfo => <MenuItem key={langInfo.id} value={langInfo.id}>{langInfo.name}</MenuItem>)}
                </Select>
            </FormControl>
        </FormField>
    );
}
