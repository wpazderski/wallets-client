import * as faSolid from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import * as KvapiTypes from "@wpazderski/kvapi-types";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

import { resolveServerError, useApiContext, UserSessionManager } from "../../../../../../app";
import { useAppDispatch } from "../../../../../../app/store";
import { updateSelfAsync } from "../../../../../../app/store/UserSlice";
import { FormField } from "../../../../common/formField/FormField";
import { UserSettingsMessage } from "../UserSettings";





export interface UserChangePasswordProps {
    withProcessing: (callback: () => Promise<UserSettingsMessage>) => (() => Promise<void>);
    forcePasswordChange?: boolean;
}

export function UserChangePassword(props: UserChangePasswordProps) {
    const withProcessing = props.withProcessing;
    
    const { t } = useTranslation();
    const api = useApiContext();
    const dispatch = useAppDispatch();
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [newPasswordRepeated, setNewPasswordRepeated] = useState("");
    const [touchedCurrentPassword, setTouchedCurrentPassword] = useState(false);
    const [touchedNewPassword, setTouchedNewPassword] = useState(false);
    const [touchedNewPasswordRepeated, setTouchedNewPasswordRepeated] = useState(false);
    
    const isCurrentPasswordOk = UserSessionManager.checkUserPassword(currentPassword as KvapiTypes.data.user.PlainPassword)
    const isNewPasswordOk = newPassword.length >= 8;
    const isNewPasswordRepeatedOk = newPassword === newPasswordRepeated;
    const canFormBeSubmitted = !!(isCurrentPasswordOk && isNewPasswordOk && isNewPasswordRepeatedOk);
    const currentPasswordError = (!touchedCurrentPassword || isCurrentPasswordOk) ? "" : t("page.userSettings.form.changePassword.currentPassword.error.mismatch");
    const newPasswordError = (!touchedNewPassword || isNewPasswordOk) ? "" : t("page.userSettings.form.changePassword.newPassword.error.tooShort");
    const newPasswordRepeatedError = (!touchedNewPasswordRepeated || isNewPasswordRepeatedOk) ? "" : t("page.userSettings.form.changePassword.passwordRepeated.error.mismatch");
    
    const handleChangePasswordClick = useCallback(() => {
        withProcessing(async () => {
            try {
                await UserSessionManager.changeUserPassword(api, newPassword as KvapiTypes.data.user.PlainPassword);
                dispatch(updateSelfAsync(api));
                setCurrentPassword("");
                setNewPassword("");
                setNewPasswordRepeated("");
                setTouchedCurrentPassword(false);
                setTouchedNewPassword(false);
                setTouchedNewPasswordRepeated(false);
                return {
                    type: "success",
                    message: t("page.userSettings.form.changePassword.result.success"),
                };
            }
            catch (err) {
                console.error(err);
                const serverError = resolveServerError(err);
                return {
                    type: "error",
                    message: t(`common.errors.server.${serverError}`),
                };
            }
        })();
    }, [api, dispatch, newPassword, t, withProcessing]);
    
    const handleCurrentPasswordChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setCurrentPassword(event.target.value);
        setTouchedCurrentPassword(true);
    }, []);
    
    const handleNewPasswordChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setNewPassword(event.target.value);
        setTouchedNewPassword(true);
    }, []);
    
    const handleNewPasswordRepeatedChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setNewPasswordRepeated(event.target.value);
        setTouchedNewPasswordRepeated(true);
    }, []);
    
    return (
        <>
            <h3>{t("page.userSettings.form.changePassword.header")}</h3>
            {props.forcePasswordChange && 
                <Alert
                    severity="info"
                >
                    {t("page.userSettings.form.changePassword.forcePasswordChangeInfo")}
                </Alert>
            }
            <FormField className="UserSettings__ChangePassword__current-password" title={t("page.userSettings.form.changePassword.currentPassword.name")}>
                <TextField
                    type="password"
                    value={currentPassword}
                    onChange={handleCurrentPasswordChange}
                    error={!!currentPasswordError} helperText={currentPasswordError || " "}
                    data-testid="UserSettings__ChangePassword__current-password"
                />
            </FormField>
            <FormField className="UserSettings__ChangePassword__new-password" title={t("page.userSettings.form.changePassword.password.name")}>
                <TextField
                    type="password"
                    value={newPassword}
                    onChange={handleNewPasswordChange}
                    error={!!newPasswordError}
                    helperText={newPasswordError || " "}
                    data-testid="UserSettings__ChangePassword__new-password"
                />
            </FormField>
            <FormField className="UserSettings__ChangePassword__new-password-repeated" title={t("page.userSettings.form.changePassword.passwordRepeated.name")}>
                <TextField
                    type="password"
                    value={newPasswordRepeated}
                    onChange={handleNewPasswordRepeatedChange}
                    error={!!newPasswordRepeatedError}
                    helperText={newPasswordRepeatedError || " "}
                    data-testid="UserSettings__ChangePassword__new-password-repeated"
                />
            </FormField>
            <FormField type="buttons">
                <Button variant="contained" onClick={handleChangePasswordClick} disabled={!canFormBeSubmitted} startIcon={<FontAwesomeIcon icon={faSolid.faKey} data-testid="UserSettings__ChangePassword__submit" />}>
                    {t("page.userSettings.form.changePassword.button")}
                </Button>
            </FormField>
        </>
    );
}
