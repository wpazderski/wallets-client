import { ChangeEvent } from "react";
import { useTranslation } from "react-i18next";

import * as faSolid from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from "@mui/material/Button";

import { ExportImport, useApiContext } from "../../../../../../app";
import { useAppDispatch } from "../../../../../../app/store";
import { FormField } from "../../../../common/formField/FormField";
import { UserSettingsMessage } from "../UserSettings";

export interface UserImportProps {
    withProcessing: (callback: () => Promise<UserSettingsMessage>) => (() => Promise<void>);
}

export function UserImport(props: UserImportProps) {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const api = useApiContext();
    
    const handleImportFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files || !event.target.files[0]) {
            return;
        }
        const importedFile = event.target.files[0];
        props.withProcessing(async () => {
            const text = await importedFile.text();
            const exportImport = new ExportImport();
            const success = await exportImport.import(text, dispatch, api);
            if (success) {
                return {
                    type: "success",
                    message: t("page.userSettings.form.import.result.success"),
                };
            }
            else {
                return {
                    type: "error",
                    message: t("page.userSettings.form.import.result.error"),
                };
            }
        })();
    };
    
    return (
        <FormField className="UserSettings__Import" title={t("page.userSettings.form.import.name")} description={t("page.userSettings.form.import.description")}>
            <Button component="label" variant="contained" startIcon={<FontAwesomeIcon icon={faSolid.faUpload} />}>
                {t("page.userSettings.form.import.button")}
                <input hidden={true} type="file" onChange={handleImportFileChange} />
            </Button>
        </FormField>
    );
}
