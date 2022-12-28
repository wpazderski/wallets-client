import * as faSolid from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from "@mui/material/Button";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";

import { resolveServerError, useApiContext } from "../../../../../../app";
import { externalDataSlice, useAppDispatch, useAppSelector } from "../../../../../../app/store";
import { selectInvestmentsTickers } from "../../../../../../app/store/InvestmentsSlice";
import { FormField } from "../../../../common/formField/FormField";
import { UserSettingsMessage } from "../UserSettings";





export interface UserUpdateDataNowProps {
    withProcessing: (callback: () => Promise<UserSettingsMessage>) => (() => Promise<void>);
}

export function UserUpdateDataNow(props: UserUpdateDataNowProps) {
    const withProcessing = props.withProcessing;
    
    const { t } = useTranslation();
    const api = useApiContext();
    const dispatch = useAppDispatch();
    const tickers = useAppSelector(selectInvestmentsTickers);
    
    const handleUpdateDataNowClick = useCallback(async () => {
        await withProcessing(async () => {
            const loadExternalDataResult = await dispatch(externalDataSlice.loadExternalDataAsync({ tickers, cacheMaxLifetime: 0, api }));
            if (loadExternalDataResult.meta.requestStatus === "fulfilled") {
                return {
                    type: "success",
                    message: t("page.userSettings.form.updateDataNow.result.success"),
                };
            }
            else {
                const serverError = ("error" in loadExternalDataResult) ? resolveServerError(loadExternalDataResult.error) : "unknown";
                return {
                    type: "error",
                    message: t(`common.errors.server.${serverError}`),
                };
            }
        })();
    }, [api, dispatch, t, tickers, withProcessing]);
    
    return (
        <FormField className="UserSettings__UpdateDataNow" title={t("page.userSettings.form.updateDataNow.name")} description={t("page.userSettings.form.updateDataNow.description")}>
            <Button variant="contained" onClick={handleUpdateDataNowClick} startIcon={<FontAwesomeIcon icon={faSolid.faRefresh} />}>
                {t("page.userSettings.form.updateDataNow.button")}
            </Button>
        </FormField>
    );
}
