import "./UserCreate.scss";

import * as faSolid from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import * as KvapiTypes from "@wpazderski/kvapi-types";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { resolveServerError, useApiContext, Utils } from "../../../../../../app";
import { useAppDispatch } from "../../../../../../app/store";
import { showUserMessage, UserMessageDuration } from "../../../../../../app/store/AppSlice";
import { addUserAsync } from "../../../../../../app/store/UsersSlice";
import { Form } from "../../../../common/form/Form";
import { FormField } from "../../../../common/formField/FormField";
import { FormSeparator } from "../../../../common/formSeparator/FormSeparator";
import { LoadingIndicator } from "../../../../common/loadingIndicator/LoadingIndicator";
import { Page } from "../../../page/Page";
import { PageContent } from "../../../pageContent/PageContent";
import { PageHeader } from "../../../pageHeader/PageHeader";





function getAvailableUserRoles(): KvapiTypes.data.user.Role[] {
    return [
        "authorized",
        "admin",
    ];
}
function generateTemporaryPassword(): KvapiTypes.data.user.PlainPassword {
    let password = Utils.randomInt(1000, 9999).toString() + "-" + Utils.randomInt(1000, 9999).toString();
    return password as KvapiTypes.data.user.PlainPassword;
}

function getUsersListUrl(): string {
    return "/users";
}

export function UserCreate() {
    const { t } = useTranslation();
    const api = useApiContext();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [userLogin, setUserLogin] = useState<KvapiTypes.data.user.Login>("" as KvapiTypes.data.user.Login);
    const [userPassword] = useState<KvapiTypes.data.user.PlainPassword>(generateTemporaryPassword());
    const [userRole, setUserRole] = useState<KvapiTypes.data.user.Role>("authorized");
    const [userLoginError, setUserLoginError] = useState("");
    
    const goToUsersList = () => {
        navigate(getUsersListUrl());
    };
    
    const handleUserRoleChange = (role: KvapiTypes.data.user.Role) => {
        setUserRole(role);
    };
    
    const handleUserLoginChange = (login: KvapiTypes.data.user.Login) => {
        setUserLogin(login);
    };
    const validateUserLogin = () => {
        if (userLogin.trim().length === 0) {
            setUserLoginError(t("page.userCreate.form.errors.loginRequired"));
            return false;
        }
        else {
            setUserLoginError("");
            return true;
        }
    };
    const handleUserLoginBlur = (login: KvapiTypes.data.user.Login) => {
        setUserLogin(login.trim() as KvapiTypes.data.user.Login);
        validateUserLogin();
    };
    
    const handleSaveChangesClick = async () => {
        if (!validateForm()) {
            return;
        }
        setIsProcessing(true);
        try {
            const result = await dispatch(addUserAsync({ user: { login: userLogin, password: userPassword, role: userRole }, api }));
            if (result.meta.requestStatus === "rejected") {
                throw "error" in result ? result.error : new Error();
            }
            dispatch(showUserMessage({
                type: "success",
                message: t("page.userCreate.form.result.success"),
                duration: UserMessageDuration.SUCCESS,
            }));
            goToUsersList();
        }
        catch (err) {
            console.error(err);
            const serverError = resolveServerError(err);
            dispatch(showUserMessage({
                type: "error",
                message: t(`common.errors.server.${serverError}`),
                duration: UserMessageDuration.ERROR,
            }));
        }
        finally {
            setIsProcessing(false);
        }
    };
    
    const handleCancelClick = () => {
        goToUsersList();
    };
    
    const validateForm = () => {
        let isOk: boolean = true;
        isOk = validateUserLogin() && isOk;
        return isOk;
    };
    
    return (
        <Page className="UserCreate">
            <PageHeader title={t("page.userCreate")} icon={<FontAwesomeIcon icon={faSolid.faUserPlus} />} />
            <PageContent>
                <Form>
                    <FormField title={t("page.userCreate.form.login.name")}>
                        <FormControl>
                            <TextField
                                value={userLogin}
                                onChange={event => handleUserLoginChange(event.target.value as KvapiTypes.data.user.Login)}
                                onBlur={event => handleUserLoginBlur(event.target.value as KvapiTypes.data.user.Login)}
                                error={!!userLoginError}
                                helperText={userLoginError || " "}
                            />
                        </FormControl>
                    </FormField>
                    <FormField title={t("page.userCreate.form.password.name")} description={t("page.userCreate.form.password.description")}>
                        <FormControl>
                            {userPassword}
                        </FormControl>
                    </FormField>
                    <FormField title={t("page.userCreate.form.role.name")}>
                        <FormControl>
                            <Select
                                value={userRole}
                                onChange={event => handleUserRoleChange(event.target.value as KvapiTypes.data.user.Role)}
                            >
                                {getAvailableUserRoles().map(userRole => <MenuItem key={userRole} value={userRole}>{t(`page.userCreate.form.role.list.${userRole}`)}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </FormField>
                    <FormSeparator />
                    <FormField type="buttons">
                        <Button
                            variant="contained"
                            startIcon={<FontAwesomeIcon icon={faSolid.faSave} />}
                            onClick={() => handleSaveChangesClick()}
                        >
                            {t("common.buttons.save")}
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={() => handleCancelClick()}
                        >
                            {t("common.buttons.cancel")}
                        </Button>
                    </FormField>
                </Form>
            </PageContent>
            {isProcessing && <LoadingIndicator />}
        </Page>
    );
}
