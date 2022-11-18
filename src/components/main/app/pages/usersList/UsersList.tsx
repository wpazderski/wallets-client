import "./UsersList.scss";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import * as faSolid from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import { DataGrid, GridColDef, GridValueGetterParams } from "@mui/x-data-grid";
import * as KvapiTypes from "@wpazderski/kvapi-types";

import { resolveServerError, useApiContext } from "../../../../../app";
import { useAppDispatch, useAppSelector } from "../../../../../app/store";
import { showUserMessage, UserMessageDuration } from "../../../../../app/store/AppSlice";
import { selectUserId } from "../../../../../app/store/UserSlice";
import { loadUsersListAsync, removeUserAsync, selectUsersList } from "../../../../../app/store/UsersSlice";
import { LoadingIndicator } from "../../../common/loadingIndicator/LoadingIndicator";
import { Page } from "../../page/Page";
import { PageContent } from "../../pageContent/PageContent";
import { PageHeader } from "../../pageHeader/PageHeader";

function getEditUserUrl(userId: KvapiTypes.data.user.Id): string {
    return `/users/${userId}/edit`;
}

function getCreateUserUrl(): string {
    return "/users/create";
}

export function UsersList() {
    const { t } = useTranslation();
    const api = useApiContext();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const signedInUserId = useAppSelector(selectUserId);
    const rows = useAppSelector(selectUsersList);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [userToDelete, setUserToDelete] = useState<KvapiTypes.data.user.UserPublic | null>(null);
    const [deleteConfirmUserLogin, setDeleteConfirmUserLogin] = useState("");
    const [isUserDeleteConfirmOpen, setIsUserDeleteConfirmOpen] = useState(false);
    
    const handleLoadingError = useCallback((err: any) => {
        console.error(err);
        const serverError = resolveServerError(err);
        dispatch(showUserMessage({
            type: "error",
            message: t(`common.errors.server.${serverError}`),
            duration: UserMessageDuration.ERROR,
        }));
        setIsLoading(false);
        setIsRefreshing(false);
    }, [dispatch, t]);
    
    useEffect(() => {
        dispatch(loadUsersListAsync(api)).then(result => {
            setIsLoading(false);
            if (result.meta.requestStatus === "rejected") {
                throw "error" in result ? result.error : new Error();
            }
        }).catch(handleLoadingError);
    }, [dispatch, api, handleLoadingError]);
    
    const handleRefreshClick = () => {
        setIsRefreshing(true);
        dispatch(loadUsersListAsync(api)).then(result => {
            setIsRefreshing(false);
            if (result.meta.requestStatus === "rejected") {
                throw "error" in result ? result.error : new Error();
            }
        }).catch(handleLoadingError);
    };
    
    const handleCreateUserClick = () => {
        navigate(getCreateUserUrl());
    };
    
    const handleEditUserClick = useCallback((userId: KvapiTypes.data.user.Id) => {
        navigate(getEditUserUrl(userId));
    }, [navigate]);
    
    const handleDeleteUserClick = useCallback((userId: KvapiTypes.data.user.Id) => {
        const user = rows.find(user => user.id === userId);
        if (!user) {
            return;
        }
        setUserToDelete(user);
        setDeleteConfirmUserLogin(user.login);
        setIsUserDeleteConfirmOpen(true);
    }, [rows]);
    const handleDeleteUserConfirmClick = async () => {
        const userId = userToDelete!.id;
        setIsProcessing(true);
        try {
            const result = await dispatch(removeUserAsync({ userId, api }));
            if (result.meta.requestStatus === "rejected") {
                throw "error" in result ? result.error : new Error();
            }
            dispatch(showUserMessage({
                type: "success",
                message: t("page.usersList.deleteUserConfirm.result.success", { login: userToDelete!.login }),
                duration: UserMessageDuration.SUCCESS,
            }));
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
        setUserToDelete(null);
        setIsUserDeleteConfirmOpen(false);
    };
    const handleDeleteUserCancelClick = () => {
        setUserToDelete(null);
        setIsUserDeleteConfirmOpen(false);
    };
    const handleDeleteUserClose = () => {
        setUserToDelete(null);
        setIsUserDeleteConfirmOpen(false);
    };
    
    const columns: GridColDef[] = useMemo(() => [
        {
            field: "login",
            headerName: t("page.usersList.table.login"),
            flex: 1,
        },
        {
            field: "role",
            headerName: t("page.usersList.table.role"),
            width: 150,
            valueGetter: (params: GridValueGetterParams) => t(`page.usersList.table.role.${params.row.role as "authorized" | "admin"}`),
        },
        {
            field: "id",
            headerName: t("page.usersList.table.actions"),
            width: 150,
            renderCell: params => {
                return (
                    <>
                        <Button variant="contained" onClick={() => handleEditUserClick(params.row.id)}>
                            <FontAwesomeIcon icon={faSolid.faPen} />
                        </Button>
                        <Button variant="contained" color="warning" onClick={() => handleDeleteUserClick(params.row.id)} disabled={params.row.id === signedInUserId}>
                            <FontAwesomeIcon icon={faSolid.faTrash} />
                        </Button>
                    </>
                )
            },
        },
    ], [handleDeleteUserClick, handleEditUserClick, signedInUserId, t]);
    
    return (
        <Page className="UsersList">
            <PageHeader title={t("page.usersList")} icon={<FontAwesomeIcon icon={faSolid.faUsers} />} />
            <PageContent>
                {!isLoading && (
                    <>
                        <Button
                            variant="contained"
                            startIcon={<FontAwesomeIcon icon={faSolid.faUserPlus} />}
                            sx={{ marginBottom: 3 }}
                            onClick={() => handleCreateUserClick()}
                        >
                            {t("page.usersList.createUser")}
                        </Button>
                        <Button
                            className="UsersList__refresh-button"
                            variant="text"
                            sx={{ marginBottom: 3, minWidth:0 }}
                            onClick={() => handleRefreshClick()}
                        >
                            <FontAwesomeIcon icon={faSolid.faRefresh} />
                        </Button>
                        <DataGrid
                            rows={rows}
                            columns={columns}
                            pageSize={50}
                            rowsPerPageOptions={[10, 20, 50, 100, 1000]}
                            disableSelectionOnClick
                            autoHeight={true}
                        />
                    </>
                )}
            </PageContent>
            <Dialog
                open={isUserDeleteConfirmOpen}
                onClose={() => handleDeleteUserClose()}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogContent id="alert-dialog-title" sx={{ margin: 3, marginBottom: 0 }}>
                    <DialogContentText>
                        {t("page.usersList.deleteUserConfirm.text", { login: deleteConfirmUserLogin })}
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ margin: 3 }}>
                    <Button variant="contained" color="warning" onClick={() => handleDeleteUserConfirmClick()} autoFocus>{t("common.buttons.yes")}</Button>
                    <Button onClick={() => handleDeleteUserCancelClick()}>{t("common.buttons.no")}</Button>
                </DialogActions>
            </Dialog>
            {(isLoading || isProcessing || isRefreshing) && <LoadingIndicator />}
        </Page>
    );
}
