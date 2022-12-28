import * as faSolid from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from "@mui/material/Button";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";

import { ExportImport } from "../../../../../../app";
import { FormField } from "../../../../common/formField/FormField";





export function UserExport() {
    const { t } = useTranslation();
    
    const handleExportClick = useCallback(() => {
        const exportImport = new ExportImport();
        exportImport.export();
    }, []);
    
    return (
        <FormField className="UserSettings__Export" title={t("page.userSettings.form.export.name")} description={t("page.userSettings.form.export.description")}>
            <Button variant="contained" onClick={handleExportClick} startIcon={<FontAwesomeIcon icon={faSolid.faDownload} />}>
                {t("page.userSettings.form.export.button")}
            </Button>
        </FormField>
    );
}
