import "./UserSettings.scss";

import * as faSolid from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

import { resolveServerError } from "../../../../../app";
import { useApiContext } from "../../../../../app/ApiContext";
import { useAppDispatch, useAppSelector } from "../../../../../app/store";
import { showUserMessage, UserMessageDuration } from "../../../../../app/store/AppSlice";
import { selectLastUpdateTimestamp } from "../../../../../app/store/ExternalDataSlice";
import {
    Lang as LangType,
    saveUserSettingsAsync,
    selectUserSettings,
    setUserSettings,
    UserSettingsState,
} from "../../../../../app/store/UserSettingsSlice";
import { Form } from "../../../common/form/Form";
import { FormSeparator } from "../../../common/formSeparator/FormSeparator";
import { LoadingIndicator } from "../../../common/loadingIndicator/LoadingIndicator";
import { Page } from "../../page/Page";
import { PageContent } from "../../pageContent/PageContent";
import { PageHeader } from "../../pageHeader/PageHeader";
import { UserChangePassword } from "./fields/UserChangePassword";
import { UserCurrencies } from "./fields/UserCurrencies";
import { UserExport } from "./fields/UserExport";
import { UserExternalDataCacheLifetime } from "./fields/UserExternalDataCacheLifetime";
import { UserImport } from "./fields/UserImport";
import { UserIncludeCancellationFees } from "./fields/UserIncludeCancellationFees";
import { UserIncludeIncomeTax } from "./fields/UserIncludeIncomeTax";
import { UserIncomeTaxAllowance } from "./fields/UserIncomeTaxAllowance";
import { UserIncomeTaxRate } from "./fields/UserIncomeTaxRate";
import { UserLang } from "./fields/UserLang";
import { UserLastDataUpdate } from "./fields/UserLastDataUpdate";
import { UserUpdateDataNow } from "./fields/UserUpdateDataNow";





export interface UserSettingsMessage {
    type: "success" | "error";
    message: string;
}

export interface UserSettingsProps {
    forSettingPassword?: boolean;
}

export function UserSettings(props: UserSettingsProps) {
    const { t, i18n } = useTranslation();
    const api = useApiContext();
    const dispatch = useAppDispatch();
    const userSettings = useAppSelector(selectUserSettings);
    const lastUpdateTimestamp = useAppSelector(selectLastUpdateTimestamp);
    const [isProcessing, setIsProcessing] = useState(false);
    const currentLang = userSettings.lang ? userSettings.lang : i18n.language as LangType;
    
    const withProcessing = useCallback((callback: () => Promise<UserSettingsMessage | null>): () => Promise<void> => {
        return async () => {
            setIsProcessing(true);
            try {
                const result = await callback();
                if (result !== null) {
                    dispatch(showUserMessage({
                        type: result.type,
                        message: result.message,
                        duration: result.type === "error" ? UserMessageDuration.ERROR : UserMessageDuration.SUCCESS,
                    }));
                }
            }
            catch (err) {
                console.error(err);
            }
            setIsProcessing(false);
        };
    }, [setIsProcessing, dispatch]);
    
    const withSettingsUpdater = useCallback((updater: (settings: UserSettingsState) => void): () => Promise<UserSettingsMessage | null> => {
        return async () => {
            const origSettings = JSON.parse(JSON.stringify(userSettings)) as UserSettingsState;
            const settings = JSON.parse(JSON.stringify(userSettings)) as UserSettingsState;
            updater(settings);
            dispatch(setUserSettings(settings));
            const result = await dispatch(saveUserSettingsAsync({ userSettings: settings, api }));
            const success = result.meta.requestStatus === "fulfilled";
            if (!success) {
                dispatch(setUserSettings(origSettings));
            }
            const serverError = ("error" in result) ? resolveServerError(result.error) : "unknown";
            return {
                type: success ? "success" : "error",
                message: success ? t("page.userSettings.form.result.success") : t(`common.errors.server.${serverError}`),
            }
        };
    }, [api, dispatch, t, userSettings]);
    
    const updateSettings = useCallback((updater: (settings: UserSettingsState) => void): Promise<void> => {
        return withProcessing(withSettingsUpdater(updater))();
    }, [withProcessing, withSettingsUpdater]);
    
    return (
        <Page className="UserSettings">
            <PageHeader title={t("page.userSettings")} icon={<FontAwesomeIcon icon={faSolid.faUserGear} />} />
            <PageContent>
                <Form>
                    <UserLang lang={currentLang} updateSettings={updateSettings} />
                    <FormSeparator />
                    {!props.forSettingPassword &&
                        <>
                            <UserCurrencies currencies={userSettings.currencies} mainCurrencyId={userSettings.mainCurrencyId} updateSettings={updateSettings} />
                            <UserIncludeCancellationFees includeCancellationFees={userSettings.includeCancellationFees} updateSettings={updateSettings} />
                            <UserIncludeIncomeTax includeIncomeTax={userSettings.includeIncomeTax} updateSettings={updateSettings} />
                            <UserIncomeTaxRate incomeTaxRate={userSettings.incomeTaxRate} updateSettings={updateSettings} />
                            <UserIncomeTaxAllowance incomeTaxAllowance={userSettings.incomeTaxAllowance} updateSettings={updateSettings} currency={userSettings.mainCurrencyId} />
                            <FormSeparator />
                            <UserLastDataUpdate lastUpdateTimestamp={lastUpdateTimestamp} />
                            <UserExternalDataCacheLifetime externalDataCacheLifetime={userSettings.externalDataCacheLifetime} updateSettings={updateSettings} />
                            <UserUpdateDataNow withProcessing={withProcessing} />
                            <FormSeparator />
                            <UserExport />
                            <UserImport withProcessing={withProcessing} />
                            <FormSeparator />
                        </>
                    }
                    <UserChangePassword withProcessing={withProcessing} forcePasswordChange={props.forSettingPassword} />
                    {isProcessing && <LoadingIndicator />}
                </Form>
                {isProcessing && <LoadingIndicator />}
            </PageContent>
        </Page>
    );
}
