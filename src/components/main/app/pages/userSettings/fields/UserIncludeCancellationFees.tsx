import { useTranslation } from "react-i18next";

import FormControl from "@mui/material/FormControl";
import Switch from "@mui/material/Switch";

import { UserSettingsState } from "../../../../../../app/store/UserSettingsSlice";
import { FormField } from "../../../../common/formField/FormField";

export interface UserIncludeCancellationFeesProps {
    includeCancellationFees: boolean;
    updateSettings: (updater: (settings: UserSettingsState) => void) => Promise<void>;
}

export function UserIncludeCancellationFees(props: UserIncludeCancellationFeesProps) {
    const { t } = useTranslation();
    
    const handleIncludeCancellationFeesChange = (value: boolean) => {
        props.updateSettings(settings => {
            settings.includeCancellationFees = value;
        });
    };
    
    return (
        <FormField className="UserSettings__IncludeCancellationFees" title={t("page.userSettings.form.includeCancellationFees.name")} description={t("page.userSettings.form.includeCancellationFees.description")}>
            <FormControl size="small">
                <Switch
                    checked={props.includeCancellationFees}
                    onChange={event => handleIncludeCancellationFeesChange(event.target.checked)}
                />
            </FormControl>
        </FormField>
    );
}
