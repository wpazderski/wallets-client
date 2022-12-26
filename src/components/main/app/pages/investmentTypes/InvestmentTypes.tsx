import "./InvestmentTypes.scss";

import * as faSolid from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import { DataGrid, GridColDef, GridValueGetterParams } from "@mui/x-data-grid";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";

import { resolveServerError, useApiContext } from "../../../../../app";
import { useAppDispatch, useAppSelector } from "../../../../../app/store";
import { showUserMessage, UserMessageDuration } from "../../../../../app/store/AppSlice";
import {
    loadInvestmentsAsync,
    selectInvestmentsList,
    selectInvestmentsLoadingState,
} from "../../../../../app/store/InvestmentsSlice";
import {
    InvestmentType,
    InvestmentTypeId,
    loadInvestmentTypesAsync,
    removeInvestmentTypeAsync,
    selectInvestmentTypesList,
    selectInvestmentTypesLoadingState,
} from "../../../../../app/store/InvestmentTypesSlice";
import { LoadingIndicator } from "../../../common/loadingIndicator/LoadingIndicator";
import { Page } from "../../page/Page";
import { PageContent } from "../../pageContent/PageContent";
import { PageHeader } from "../../pageHeader/PageHeader";





interface Row extends InvestmentType {
    numInvestments: number;
}

export function getInvestmentTypesListUrl(): string {
    return "/investmentTypes";
}

export function getViewInvestmentTypeUrl(investmentTypeId: InvestmentTypeId): string {
    return `/investmentTypes/${investmentTypeId}`;
}

export function getEditInvestmentTypeUrl(investmentTypeId: InvestmentTypeId): string {
    return `/investmentTypes/${investmentTypeId}/edit`;
}

export function getCreateInvestmentTypeUrl(): string {
    return "/investmentTypes/create";
}

export function InvestmentTypes() {
    const { t } = useTranslation();
    const api = useApiContext();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const investmentTypes = useAppSelector(selectInvestmentTypesList);
    const investments = useAppSelector(selectInvestmentsList);
    const investmentTypesLoadingState = useAppSelector(selectInvestmentTypesLoadingState);
    const investmentsLoadingState = useAppSelector(selectInvestmentsLoadingState);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [investmentTypeToDelete, setInvestmentTypeToDelete] = useState<InvestmentType | null>(null);
    const [deleteConfirmInvestmentTypeName, setDeleteConfirmInvestmentTypeName] = useState("");
    const [isInvestmentTypeDeleteConfirmOpen, setIsInvestmentTypeDeleteConfirmOpen] = useState(false);
    
    const rows: Row[] = useMemo(() => {
        return isLoading ? [] : investmentTypes.map(investmentType => ({
            ...investmentType,
            numInvestments: investments.filter(investment => investment.type === investmentType.id).length,
        }));
    }, [isLoading, investmentTypes, investments]);
    
    const handleLoadingError = useCallback((err: any) => {
        console.error(err);
        const serverError = resolveServerError(err);
        if (serverError === "notFound") {
            return;
        }
        dispatch(showUserMessage({
            type: "error",
            message: t(`common.errors.server.${serverError}`),
            duration: UserMessageDuration.ERROR,
        }));
        setIsLoading(false);
        setIsRefreshing(false);
    }, [dispatch, t]);
    
    useEffect(() => {
        Promise.all([
            (investmentTypesLoadingState === "not-loaded" || investmentTypesLoadingState === "failed") ? dispatch(loadInvestmentTypesAsync(api)) : Promise.resolve(true as const),
            (investmentsLoadingState === "not-loaded" || investmentsLoadingState === "failed") ? dispatch(loadInvestmentsAsync(api)) : Promise.resolve(true as const),
        ]).then(results => {
            setIsLoading(false);
            for (const result of results) {
                if (result !== true && result.meta.requestStatus === "rejected") {
                    throw "error" in result ? result.error : new Error();
                }
            }
        }).catch(handleLoadingError);
    }, [dispatch, api, investmentTypesLoadingState, investmentsLoadingState, handleLoadingError]);
    
    const handleRefreshClick = () => {
        setIsRefreshing(true);
        Promise.all([
            dispatch(loadInvestmentTypesAsync(api)),
            dispatch(loadInvestmentsAsync(api)),
        ]).then(results => {
            setIsRefreshing(false);
            for (const result of results) {
                if (result.meta.requestStatus === "rejected") {
                    throw "error" in result ? result.error : new Error();
                }
            }
        }).catch(handleLoadingError);
    };
    
    const handleViewInvestmentTypeClick = useCallback((investmentTypeId: InvestmentTypeId) => {
        navigate(getViewInvestmentTypeUrl(investmentTypeId));
    }, [navigate]);
    
    const handleCreateInvestmentTypeClick = () => {
        navigate(getCreateInvestmentTypeUrl());
    };
    
    const handleEditInvestmentTypeClick = useCallback((investmentTypeId: InvestmentTypeId) => {
        navigate(getEditInvestmentTypeUrl(investmentTypeId));
    }, [navigate]);
    
    const handleDeleteInvestmentTypeClick = useCallback((investmentTypeId: InvestmentTypeId) => {
        const investmentType = rows.find(investmentType => investmentType.id === investmentTypeId);
        if (!investmentType) {
            return;
        }
        setInvestmentTypeToDelete(investmentType);
        setDeleteConfirmInvestmentTypeName(investmentType.name);
        setIsInvestmentTypeDeleteConfirmOpen(true);
    }, [rows]);
    
    const handleDeleteInvestmentTypeConfirmClick = async () => {
        const investmentTypeId = investmentTypeToDelete!.id;
        setIsProcessing(true);
        try {
            const result = await dispatch(removeInvestmentTypeAsync({ investmentTypeId, api }));
            if (result.meta.requestStatus === "rejected") {
                throw "error" in result ? result.error : new Error();
            }
            dispatch(showUserMessage({
                type: "success",
                message: t("page.investmentTypes.deleteInvestmentTypeConfirm.result.success", { name: investmentTypeToDelete!.name }),
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
        setInvestmentTypeToDelete(null);
        setIsInvestmentTypeDeleteConfirmOpen(false);
    };
    const handleDeleteInvestmentTypeCancelClick = () => {
        setInvestmentTypeToDelete(null);
        setIsInvestmentTypeDeleteConfirmOpen(false);
    };
    const handleDeleteInvestmentTypeClose = () => {
        setInvestmentTypeToDelete(null);
        setIsInvestmentTypeDeleteConfirmOpen(false);
    };
    
    const columns: GridColDef[] = useMemo(() => [
        {
            field: "name",
            headerName: t("page.investmentTypes.table.name"),
            flex: 1,
            valueGetter: (params: GridValueGetterParams) => params.row.isPredefined ? t(`common.investmentTypes.${params.row.name}` as any) : params.row.name,
            renderCell: params => {
                return (
                    <Link to={getViewInvestmentTypeUrl(params.row.id)}>
                        <FontAwesomeIcon icon={params.row.icon} fixedWidth />
                        <span style={{ marginLeft: "10px" }}>{params.value}</span>
                    </Link>
                );
            },
        },
        {
            field: "isPredefined",
            headerName: t("page.investmentTypes.table.type"),
            width: 150,
            valueGetter: (params: GridValueGetterParams) => params.row.isPredefined ? t("page.investmentTypes.table.type.predefined") : t("page.investmentTypes.table.type.custom"),
        },
        {
            field: "numInvestments",
            headerName: t("page.investmentTypes.table.numInvestments"),
            width: 250,
        },
        {
            field: "id",
            headerName: t("page.investmentTypes.table.actions"),
            width: 200,
            renderCell: params => {
                return (
                    <>
                        <Button variant="contained" onClick={() => handleViewInvestmentTypeClick(params.row.id)}>
                            <FontAwesomeIcon icon={faSolid.faEye} />
                        </Button>
                        <Button variant="contained" onClick={() => handleEditInvestmentTypeClick(params.row.id)}>
                            <FontAwesomeIcon icon={faSolid.faPen} />
                        </Button>
                        <Button variant="contained" color="warning" onClick={() => handleDeleteInvestmentTypeClick(params.row.id)} disabled={params.row.isPredefined || params.row.numInvestments > 0}>
                            <FontAwesomeIcon icon={faSolid.faTrash} />
                        </Button>
                    </>
                )
            },
        },
    ], [handleDeleteInvestmentTypeClick, handleEditInvestmentTypeClick, handleViewInvestmentTypeClick, t]);
    
    return (
        <Page className="InvestmentTypes">
            <PageHeader title={t("page.investmentTypes")} icon={<FontAwesomeIcon icon={faSolid.faFolder} />} />
            <PageContent>
                <Button
                    variant="contained"
                    startIcon={<FontAwesomeIcon icon={faSolid.faFolderPlus} />}
                    sx={{ marginBottom: 3 }}
                    onClick={() => handleCreateInvestmentTypeClick()}
                >
                    {t("page.investmentTypes.createInvestmentType")}
                </Button>
                <Button
                    className="InvestmentTypes__refresh-button"
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
            </PageContent>
            <Dialog
                open={isInvestmentTypeDeleteConfirmOpen}
                onClose={() => handleDeleteInvestmentTypeClose()}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogContent id="alert-dialog-title" sx={{ margin: 3, marginBottom: 0 }}>
                    <DialogContentText>
                        {t("page.investmentTypes.deleteInvestmentTypeConfirm.text", { name: deleteConfirmInvestmentTypeName })}
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ margin: 3 }}>
                    <Button variant="contained" color="warning" onClick={() => handleDeleteInvestmentTypeConfirmClick()} autoFocus>{t("common.buttons.yes")}</Button>
                    <Button onClick={() => handleDeleteInvestmentTypeCancelClick()}>{t("common.buttons.no")}</Button>
                </DialogActions>
            </Dialog>
            {(isLoading || isProcessing || isRefreshing) && <LoadingIndicator />}
        </Page>
    );
}
