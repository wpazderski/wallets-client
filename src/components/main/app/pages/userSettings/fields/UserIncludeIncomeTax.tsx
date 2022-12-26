import FormControl from "@mui/material/FormControl";
import Switch from "@mui/material/Switch";
import { useTranslation } from "react-i18next";

import { UserSettingsState } from "../../../../../../app/store/UserSettingsSlice";
import { FormField } from "../../../../common/formField/FormField";





export interface UserIncludeIncomeTaxProps {
    includeIncomeTax: boolean;
    updateSettings: (updater: (settings: UserSettingsState) => void) => Promise<void>;
}

export function UserIncludeIncomeTax(props: UserIncludeIncomeTaxProps) {
    const { t } = useTranslation();
    
    const handleIncludeIncomeTaxChange = (value: boolean) => {
        props.updateSettings(settings => {
            settings.includeIncomeTax = value;
        });
    };
    
    return (
        <FormField className="UserSettings__IncludeIncomeTax" title={t("page.userSettings.form.includeIncomeTax.name")} description={t("page.userSettings.form.includeIncomeTax.description")}>
            <FormControl size="small">
                <Switch
                    checked={props.includeIncomeTax}
                    onChange={event => handleIncludeIncomeTaxChange(event.target.checked)}
                />
            </FormControl>
        </FormField>
    );
}
