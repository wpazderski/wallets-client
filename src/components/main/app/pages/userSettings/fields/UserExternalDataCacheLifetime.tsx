import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";

import { getAvailableAutomaticDataUpdateOptions } from "../../../../../../app/store/ExternalDataSlice";
import {
    ExternalDataCacheLifetime as ExternalDataCacheLifetimeType,
    UserSettingsState,
} from "../../../../../../app/store/UserSettingsSlice";
import { FormField } from "../../../../common/formField/FormField";





export interface UserExternalDataCacheLifetimeProps {
    externalDataCacheLifetime: ExternalDataCacheLifetimeType;
    updateSettings: (updater: (settings: UserSettingsState) => void) => Promise<void>;
}

export function UserExternalDataCacheLifetime(props: UserExternalDataCacheLifetimeProps) {
    const updateSettings = props.updateSettings;
    
    const { t } = useTranslation();
    
    const handleAutomaticDataUpdateChange = useCallback((event: SelectChangeEvent<ExternalDataCacheLifetimeType>) => {
        const value = parseInt(`${event.target.value}`) as ExternalDataCacheLifetimeType;
        updateSettings(settings => {
            settings.externalDataCacheLifetime = value;
        });
    }, [updateSettings]);
    
    return (
        <FormField className="UserSettings__ExternalDataCacheLifetime" title={t("page.userSettings.form.externalDataCacheLifetime.name")} description={t("page.userSettings.form.externalDataCacheLifetime.description")}>
            <FormControl size="small">
                <Select
                    value={props.externalDataCacheLifetime}
                    onChange={handleAutomaticDataUpdateChange}
                >
                    {getAvailableAutomaticDataUpdateOptions().map(option => <MenuItem key={option.id} value={option.cacheMaxLifetime}>{t(`page.userSettings.form.externalDataCacheLifetime.option.${option.id}` as any)}</MenuItem>)}
                </Select>
            </FormControl>
        </FormField>
    );
}
