import { useTranslation } from "react-i18next";

import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";

import { getAvailableAutomaticDataUpdateOptions } from "../../../../../../app/store/ExternalDataSlice";
import { ExternalDataCacheLifetime as ExternalDataCacheLifetimeType, UserSettingsState } from "../../../../../../app/store/UserSettingsSlice";
import { FormField } from "../../../../common/formField/FormField";

export interface UserExternalDataCacheLifetimeProps {
    externalDataCacheLifetime: ExternalDataCacheLifetimeType;
    updateSettings: (updater: (settings: UserSettingsState) => void) => Promise<void>;
}

export function UserExternalDataCacheLifetime(props: UserExternalDataCacheLifetimeProps) {
    const { t } = useTranslation();
    
    const handleAutomaticDataUpdateChange = (value: ExternalDataCacheLifetimeType) => {
        props.updateSettings(settings => {
            settings.externalDataCacheLifetime = value;
        });
    };
    
    return (
        <FormField className="UserSettings__ExternalDataCacheLifetime" title={t("page.userSettings.form.externalDataCacheLifetime.name")} description={t("page.userSettings.form.externalDataCacheLifetime.description")}>
            <FormControl size="small">
                <Select
                    value={props.externalDataCacheLifetime}
                    onChange={event => handleAutomaticDataUpdateChange(parseInt(`${event.target.value}`) as ExternalDataCacheLifetimeType)}
                >
                    {getAvailableAutomaticDataUpdateOptions().map(option => <MenuItem key={option.id} value={option.cacheMaxLifetime}>{t(`page.userSettings.form.externalDataCacheLifetime.option.${option.id}` as any)}</MenuItem>)}
                </Select>
            </FormControl>
        </FormField>
    );
}
