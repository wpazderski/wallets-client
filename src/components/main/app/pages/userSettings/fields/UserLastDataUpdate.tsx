import { useTranslation } from "react-i18next";

import { DateTime } from "../../../../common/dateTime/DateTime";
import { FormField } from "../../../../common/formField/FormField";

export interface UserLastDataUpdateProps {
    lastUpdateTimestamp: number;
}

export function UserLastDataUpdate(props: UserLastDataUpdateProps) {
    const { t } = useTranslation();
    
    return (
        <FormField className="UserSettings__LastDataUpdate" title={t("page.userSettings.form.lastDataUpdate.name")} description={t("page.userSettings.form.lastDataUpdate.description")}>
            <DateTime showDate={true} showTime={true} timestamp={props.lastUpdateTimestamp} />
        </FormField>
    );
}
