import "./SignIn.scss";

import * as faSolid from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import * as KvapiTypes from "@wpazderski/kvapi-types";
import { FormEvent, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

import { resolveServerError, UserSessionManager } from "../../../../../app";
import { useApiContext } from "../../../../../app/ApiContext";
import { useAppDispatch } from "../../../../../app/store";
import { refreshAppInfoAsync } from "../../../../../app/store/AppInfoSlice";
import { showUserMessage, UserMessageDuration } from "../../../../../app/store/AppSlice";
import { Form } from "../../../common/form/Form";
import { FormField } from "../../../common/formField/FormField";
import { FormSeparator } from "../../../common/formSeparator/FormSeparator";
import { LoadingIndicator } from "../../../common/loadingIndicator/LoadingIndicator";
import { Page } from "../../page/Page";
import { PageContent } from "../../pageContent/PageContent";
import { PageHeader } from "../../pageHeader/PageHeader";





export function SignIn() {
    const { t } = useTranslation();
    const api = useApiContext();
    const dispatch = useAppDispatch();
    const [isProcessing, setIsProcessing] = useState(false);
    const [userLogin, setUserLogin] = useState("");
    const [userPassword, setUserPassword] = useState("");
    const [userLoginError, setUserLoginError] = useState("");
    const [userPasswordError, setUserPasswordError] = useState("");
    
    const validateForm = useCallback(() => {
        let hasErrors: boolean = false;
        if (userLogin.length === 0) {
            hasErrors = true;
            setUserLoginError(t("page.signIn.form.errors.loginRequired"));
        }
        else {
            setUserLoginError("");
        }
        if (userPassword.length === 0) {
            hasErrors = true;
            setUserPasswordError(t("page.signIn.form.errors.passwordRequired"));
        }
        else {
            setUserPasswordError("");
        }
        return !hasErrors;
    }, [t, userLogin.length, userPassword.length]);
    
    const handleSubmit = useCallback(async (e: FormEvent) => {
        if (isProcessing) {
            return;
        }
        e.preventDefault();
        if (!validateForm()) {
            return;
        }
        setIsProcessing(true);
        try {
            await UserSessionManager.signIn(
                api,
                userLogin as KvapiTypes.data.user.Login,
                userPassword as KvapiTypes.data.user.PlainPassword,
            );
            setIsProcessing(false);
            dispatch(refreshAppInfoAsync(api));
        }
        catch (err) {
            console.error(err);
            const serverError = resolveServerError(err);
            dispatch(showUserMessage({
                type: "error",
                message: t(`common.errors.server.${serverError}`),
                duration: UserMessageDuration.ERROR,
            }));
            setIsProcessing(false);
        }
    }, [api, dispatch, isProcessing, t, userLogin, userPassword, validateForm]);
    
    const handleUserLoginChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setUserLogin(event.target.value); 
    }, []);
    
    const handleUserPasswordChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setUserPassword(event.target.value); 
    }, []);
    
    return (
        <Page className="SignIn">
            <PageHeader title={t("page.signIn")} icon={<FontAwesomeIcon icon={faSolid.faSignIn} />} />
            <PageContent>
                <Form onSubmit={handleSubmit}>
                    <FormField title={t("page.signIn.form.login")}>
                        <TextField type="text" value={userLogin} onChange={handleUserLoginChange} error={!!userLoginError} helperText={userLoginError || " "} data-testid="SignIn__login" />
                    </FormField>
                    <FormField title={t("page.signIn.form.password")}>
                        <TextField type="password" value={userPassword} onChange={handleUserPasswordChange} error={!!userPasswordError} helperText={userPasswordError || " "} data-testid="SignIn__password" />
                    </FormField>
                    <FormSeparator />
                    <FormField type="buttons">
                        <Button type="submit" variant="contained" disabled={isProcessing} data-testid="SignIn__submit">{t("page.signIn.form.buttons.signIn")}</Button>
                    </FormField>
                </Form>
                {isProcessing && <LoadingIndicator />}
            </PageContent>
        </Page>
    );
}
