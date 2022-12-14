import "./CreateFirstUser.scss";

import * as faSolid from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import * as KvapiTypes from "@wpazderski/kvapi-types";
import { FormEvent, useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

import { resolveServerError } from "../../../../../../app";
import { useApiContext } from "../../../../../../app/ApiContext";
import { useAppDispatch } from "../../../../../../app/store";
import { refreshAppInfoAsync } from "../../../../../../app/store/AppInfoSlice";
import { showUserMessage, UserMessageDuration } from "../../../../../../app/store/AppSlice";
import { Form } from "../../../../common/form/Form";
import { FormField } from "../../../../common/formField/FormField";
import { FormSeparator } from "../../../../common/formSeparator/FormSeparator";
import { LoadingIndicator } from "../../../../common/loadingIndicator/LoadingIndicator";
import { Page } from "../../../page/Page";
import { PageContent } from "../../../pageContent/PageContent";
import { PageHeader } from "../../../pageHeader/PageHeader";





export function CreateFirstUser() {
    const { t } = useTranslation();
    const api = useApiContext();
    const dispatch = useAppDispatch();
    const [isProcessing, setIsProcessing] = useState(false);
    const [userLogin, setUserLogin] = useState("");
    const [userPassword, setUserPassword] = useState("");
    const [userPasswordRepeat, setUserPasswordRepeat] = useState("");
    const [userLoginError, setUserLoginError] = useState("");
    const [userPasswordError, setUserPasswordError] = useState("");
    const [userPasswordRepeatError, setUserPasswordRepeatError] = useState("");
    
    const validateForm = useCallback(() => {
        let hasErrors: boolean = false;
        if (userLogin.trim().length === 0) {
            hasErrors = true;
            setUserLoginError(t("page.createFirstUser.form.errors.loginRequired"));
        }
        else {
            setUserLoginError("");
        }
        if (userPassword.trim().length < 8) {
            hasErrors = true;
            setUserPasswordError(t("page.createFirstUser.form.errors.passwordTooShort"));
        }
        else {
            setUserPasswordError("");
        }
        if (userPassword !== userPasswordRepeat) {
            hasErrors = true;
            setUserPasswordRepeatError(t("page.createFirstUser.form.errors.passwordsNotIdentical"));
        }
        else {
            setUserPasswordRepeatError("");
        }
        return !hasErrors;
    }, [t, userLogin, userPassword, userPasswordRepeat]);
    
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
            await api.users.create({
                login: userLogin.trim() as KvapiTypes.data.user.Login,
                password: userPassword.trim() as KvapiTypes.data.user.PlainPassword,
                role: "admin",
            });
            dispatch(showUserMessage({
                type: "success",
                message: t("page.createFirstUser.form.result.success"),
                duration: UserMessageDuration.SUCCESS,
            }));
            setTimeout(() => {
                setIsProcessing(false);
                dispatch(refreshAppInfoAsync(api));
            }, 1000);
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
    
    const handleUserPasswordRepeatChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setUserPasswordRepeat(event.target.value);
    }, []);
    
    return (
        <Page className="CreateFirstUser">
            <PageHeader title={t("page.createFirstUser")} icon={<FontAwesomeIcon icon={faSolid.faUserPlus} />} />
            <PageContent>
                <Form onSubmit={handleSubmit}>
                    <FormField title={t("page.createFirstUser.form.login")}>
                        <TextField type="text" value={userLogin} onChange={handleUserLoginChange} error={!!userLoginError} helperText={userLoginError || " "} />
                    </FormField>
                    <FormField title={t("page.createFirstUser.form.password")}>
                        <TextField type="password" value={userPassword} onChange={handleUserPasswordChange} error={!!userPasswordError} helperText={userPasswordError || " "} />
                    </FormField>
                    <FormField title={t("page.createFirstUser.form.passwordRepeat")}>
                        <TextField type="password" value={userPasswordRepeat} onChange={handleUserPasswordRepeatChange} error={!!userPasswordRepeatError} helperText={userPasswordRepeatError || " "} />
                    </FormField>
                    <FormSeparator />
                    <FormField type="buttons">
                        <Button type="submit" variant="contained" disabled={isProcessing}>{t("page.createFirstUser.form.buttons.create")}</Button>
                    </FormField>
                </Form>
                {isProcessing && <LoadingIndicator />}
            </PageContent>
        </Page>
    );
}
