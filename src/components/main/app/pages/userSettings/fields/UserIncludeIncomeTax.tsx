import FormControl from "@mui/material/FormControl";
import Switch from "@mui/material/Switch";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";

import { UserSettingsState } from "../../../../../../app/store/UserSettingsSlice";
import { FormField } from "../../../../common/formField/FormField";





export interface UserIncludeIncomeTaxProps {
    includeIncomeTax: boolean;
    updateSettings: (updater: (settings: UserSettingsState) => void) => Promise<void>;
}

export function UserIncludeIncomeTax(props: UserIncludeIncomeTaxProps) {
    const updateSettings = props.updateSettings;
    
    const { t } = useTranslation();
    
    const handleIncludeIncomeTaxChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.checked;
        updateSettings(settings => {
            settings.includeIncomeTax = value;
        });
    }, [updateSettings]);
    
    return (
        <FormField className="UserSettings__IncludeIncomeTax" title={t("page.userSettings.form.includeIncomeTax.name")} description={t("page.userSettings.form.includeIncomeTax.description")}>
            <FormControl size="small">
                <Switch
                    checked={props.includeIncomeTax}
                    onChange={handleIncludeIncomeTaxChange}
                />
            </FormControl>
        </FormField>
    );
}
