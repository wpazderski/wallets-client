import "./UserEdit.scss";

import * as faSolid from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import * as KvapiTypes from "@wpazderski/kvapi-types";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { resolveServerError, useApiContext } from "../../../../../../app";
import { useAppDispatch, useAppSelector } from "../../../../../../app/store";
import { showUserMessage, UserMessageDuration } from "../../../../../../app/store/AppSlice";
import { selectUserId } from "../../../../../../app/store/UserSlice";
import { loadUserAsync, updateUserAsync } from "../../../../../../app/store/UsersSlice";
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

function getUsersListUrl(): string {
    return "/users";
}

export function UserEdit() {
    const { userId } = useParams() as { userId: KvapiTypes.data.user.Id };
    const { t } = useTranslation();
    const api = useApiContext();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const signedInUserId = useAppSelector(selectUserId);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false);
    const [user, setUser] = useState<KvapiTypes.data.user.UserPublic | null>(null);
    const [userLogin, setUserLogin] = useState<KvapiTypes.data.user.Login>("" as KvapiTypes.data.user.Login);
    const [userRole, setUserRole] = useState<KvapiTypes.data.user.Role>("authorized");
    const [userFetchError, setUserFetchError] = useState("");
    const [userLoginError, setUserLoginError] = useState("");
    
    const goToUsersList = useCallback(() => {
        navigate(getUsersListUrl());
    }, [navigate]);
    
    useEffect(() => {
        dispatch(loadUserAsync({ userId, api })).then(result => {
            if (result.meta.requestStatus === "rejected") {
                if ("error" in result) {
                    throw result.error instanceof Error ? result.error : new Error(result.error.message ? result.error.message : `${result.error}`);
                }
                else {
                    throw new Error("Server error");
                }
            }
            const user = result.payload as KvapiTypes.data.user.UserPublic;
            setUser(user);
            setUserRole(user.role);
            setUserLogin(user.login);
            setIsLoading(false);
        })
        .catch(err => {
            console.error(err);
            const serverError = resolveServerError(err);
            setUserFetchError(t(`common.errors.server.${serverError}`));
            setIsLoading(false);
        });
    }, [api, dispatch, goToUsersList, t, userId]);
    
    const handleUserRoleChange = useCallback((event: SelectChangeEvent<KvapiTypes.data.user.Role>) => {
        setUserRole(event.target.value as KvapiTypes.data.user.Role);
    }, []);
    
    const validateUserLogin = useCallback(() => {
        if (userLogin.trim().length === 0) {
            setUserLoginError(t("page.userCreate.form.errors.loginRequired"));
            return false;
        }
        else {
            setUserLoginError("");
            return true;
        }
    }, [t, userLogin]);
    
    const handleUserLoginChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setUserLogin(event.target.value as KvapiTypes.data.user.Login);
    }, []);
    
    const handleUserLoginBlur = useCallback((event: React.FocusEvent<HTMLInputElement>) => {
        setUserLogin(event.target.value.trim() as KvapiTypes.data.user.Login);
        validateUserLogin();
    }, [validateUserLogin]);
    
    const validateForm = useCallback(() => {
        let isOk: boolean = true;
        isOk = validateUserLogin() && isOk;
        return isOk;
    }, [validateUserLogin]);
    
    const handleSaveChangesClick = useCallback(async () => {
        if (!validateForm()) {
            return;
        }
        setIsProcessing(true);
        try {
            const result = await dispatch(updateUserAsync({ userId, user: { login: userLogin, role: userRole }, api }));
            if (result.meta.requestStatus === "rejected") {
                throw "error" in result ? result.error : new Error();
            }
            dispatch(showUserMessage({
                type: "success",
                message: t("page.userEdit.form.result.success"),
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
    }, [api, dispatch, goToUsersList, t, userId, userLogin, userRole, validateForm]);
    
    const handleCancelClick = useCallback(() => {
        goToUsersList();
    }, [goToUsersList]);
    
    return (
        <Page className="UserEdit">
            <PageHeader title={t("page.userEdit") + (user ? ": " + user.login : "")} icon={<FontAwesomeIcon icon={faSolid.faUserPen} />} />
            <PageContent>
                {user && (
                    <Form>
                        <FormField title={t("page.userEdit.form.login.name")}>
                            <FormControl>
                                <TextField
                                    value={userLogin}
                                    onChange={handleUserLoginChange}
                                    onBlur={handleUserLoginBlur}
                                    error={!!userLoginError}
                                    helperText={userLoginError || " "}
                                />
                            </FormControl>
                        </FormField>
                        <FormField title={t("page.userEdit.form.role.name")}>
                            <FormControl>
                                <Select
                                    value={userRole}
                                    onChange={handleUserRoleChange}
                                    disabled={userId === signedInUserId}
                                >
                                    {getAvailableUserRoles().map(userRole => <MenuItem key={userRole} value={userRole}>{t(`page.userEdit.form.role.list.${userRole}`)}</MenuItem>)}
                                </Select>
                            </FormControl>
                        </FormField>
                        <FormSeparator />
                        <FormField type="buttons">
                            <Button
                                variant="contained"
                                startIcon={<FontAwesomeIcon icon={faSolid.faSave} />}
                                onClick={handleSaveChangesClick}
                            >
                                {t("common.buttons.save")}
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={handleCancelClick}
                            >
                                {t("common.buttons.cancel")}
                            </Button>
                        </FormField>
                    </Form>
                )}
                {userFetchError && (
                    <Alert
                        severity="error"
                        variant="filled"
                    >
                        {userFetchError}
                    </Alert>
                )}
            </PageContent>
            {(isLoading || isProcessing) && <LoadingIndicator />}
        </Page>
    );
}
