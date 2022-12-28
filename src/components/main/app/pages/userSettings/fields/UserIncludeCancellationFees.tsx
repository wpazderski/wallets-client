import FormControl from "@mui/material/FormControl";
import Switch from "@mui/material/Switch";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";

import { UserSettingsState } from "../../../../../../app/store/UserSettingsSlice";
import { FormField } from "../../../../common/formField/FormField";





export interface UserIncludeCancellationFeesProps {
    includeCancellationFees: boolean;
    updateSettings: (updater: (settings: UserSettingsState) => void) => Promise<void>;
}

export function UserIncludeCancellationFees(props: UserIncludeCancellationFeesProps) {
    const updateSettings = props.updateSettings;
    
    const { t } = useTranslation();
    
    const handleIncludeCancellationFeesChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.checked;
        updateSettings(settings => {
            settings.includeCancellationFees = value;
        });
    }, [updateSettings]);
    
    return (
        <FormField className="UserSettings__IncludeCancellationFees" title={t("page.userSettings.form.includeCancellationFees.name")} description={t("page.userSettings.form.includeCancellationFees.description")}>
            <FormControl size="small">
                <Switch
                    checked={props.includeCancellationFees}
                    onChange={handleIncludeCancellationFeesChange}
                />
            </FormControl>
        </FormField>
    );
}
