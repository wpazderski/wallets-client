import "./Investments.scss";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useParams } from "react-router-dom";

import * as faSolid from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

import { resolveServerError, useApiContext } from "../../../../../app";
import { useAppDispatch, useAppSelector } from "../../../../../app/store";
import { showUserMessage, UserMessageDuration } from "../../../../../app/store/AppSlice";
import { selectExternalData } from "../../../../../app/store/ExternalDataSlice";
import { Investment, InvestmentId, loadInvestmentsAsync, removeInvestmentAsync, selectInvestmentsList, selectInvestmentsLoadingState } from "../../../../../app/store/InvestmentsSlice";
import { InvestmentType, InvestmentTypeSlug, loadInvestmentTypesAsync, selectInvestmentTypesList, selectInvestmentTypesLoadingState } from "../../../../../app/store/InvestmentTypesSlice";
import { selectUserSettings } from "../../../../../app/store/UserSettingsSlice";
import { Calculator } from "../../../../../app/valueCalculation";
import { DateTime } from "../../../common/dateTime/DateTime";
import { LoadingIndicator } from "../../../common/loadingIndicator/LoadingIndicator";
import { NumberView } from "../../../common/numberView/NumberView";
import { Page } from "../../page/Page";
import { PageContent } from "../../pageContent/PageContent";
import { PageHeader } from "../../pageHeader/PageHeader";
import { getViewInvestmentTypeUrl } from "../investmentTypes/InvestmentTypes";

interface InvestmentRow extends Investment {
    rowType: "investment";
    currentValue: number;
}

interface InvestmentTypeRow extends InvestmentType {
    rowType: "investmentType";
}

type Row = InvestmentRow | InvestmentTypeRow;

export function getInvestmentsListUrl(investmentTypeSlug: InvestmentTypeSlug): string {
    return `/investments/${investmentTypeSlug}`;
}

export function getViewInvestmentUrl(investmentTypeSlug: InvestmentTypeSlug, investmentId: InvestmentId): string {
    return `/investments/${investmentTypeSlug}/${investmentId}`;
}

export function getEditInvestmentUrl(investmentTypeSlug: InvestmentTypeSlug, investmentId: InvestmentId): string {
    return `/investments/${investmentTypeSlug}/${investmentId}/edit`;
}

export function getCreateInvestmentUrl(investmentTypeSlug: InvestmentTypeSlug): string {
    return `/investments/${investmentTypeSlug}/create`;
}

export function Investments() {
    const { investmentTypeSlug } = useParams() as { investmentTypeSlug: InvestmentTypeSlug };
    const { t } = useTranslation();
    const api = useApiContext();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const externalData = useAppSelector(selectExternalData);
    const userSettings = useAppSelector(selectUserSettings);
    const investmentTypes = useAppSelector(selectInvestmentTypesList);
    const allInvestments = useAppSelector(selectInvestmentsList);
    const investmentTypesLoadingState = useAppSelector(selectInvestmentTypesLoadingState);
    const investmentsLoadingState = useAppSelector(selectInvestmentsLoadingState);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [investmentToDelete, setInvestmentToDelete] = useState<Investment | null>(null);
    const [deleteConfirmInvestmentName, setDeleteConfirmInvestmentName] = useState("");
    const [isInvestmentDeleteConfirmOpen, setIsInvestmentDeleteConfirmOpen] = useState(false);
    
    const investmentType = investmentTypeSlug === "all" ? null : investmentTypes.find(investmentType => investmentType.slug === investmentTypeSlug);
    const investments = useMemo(() => {
        return investmentType ? allInvestments.filter(investment => investment.type === investmentType.id) : [...allInvestments];
    }, [allInvestments, investmentType]);
    
    const rows: Row[] = useMemo(() => {
        const investmentRows: InvestmentRow[] = isLoading ? [] : investments.map(investment => ({
            rowType: "investment",
            ...investment,
            currentValue: new Calculator(investment, externalData, userSettings).calculate(),
        }));
        if (investmentTypeSlug === "all") {
            const investmentRowsByInvestmentTypeId: { [investmentTypeId: string]: InvestmentRow[] } = {};
            for (const investmentRow of investmentRows) {
                if (!(investmentRow.type in investmentRowsByInvestmentTypeId)) {
                    investmentRowsByInvestmentTypeId[investmentRow.type] = [];
                }
                investmentRowsByInvestmentTypeId[investmentRow.type].push(investmentRow);
            }
            
            const rows: Row[] = [];
            for (const investmentTypeId in investmentRowsByInvestmentTypeId) {
                const investmentRowsForInvestmentType = investmentRowsByInvestmentTypeId[investmentTypeId];
                const investmentType = investmentTypes.find(investmentType => investmentType.id === investmentTypeId)!;
                const investmentTypeRow: InvestmentTypeRow = { rowType: "investmentType", ...investmentType };
                rows.push(investmentTypeRow);
                rows.push(...investmentRowsForInvestmentType);
            }
            
            return rows;
        }
        else {
            return investmentRows;
        }
    }, [isLoading, investments, investmentTypes, investmentTypeSlug, externalData, userSettings]);
    
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
    }, [dispatch, api, handleLoadingError, investmentTypesLoadingState, investmentsLoadingState]);
    
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
    
    const handleViewInvestmentClick = useCallback((investmentId: InvestmentId) => {
        const investment = allInvestments.find(investment => investment.id === investmentId)!;
        const investmentType = investmentTypes.find(investmentType => investmentType.id === investment.type)!;
        navigate(getViewInvestmentUrl(investmentType.slug, investmentId));
    }, [navigate, allInvestments, investmentTypes]);
    
    const handleEditInvestmentClick = useCallback((investmentId: InvestmentId) => {
        const investment = allInvestments.find(investment => investment.id === investmentId)!;
        const investmentType = investmentTypes.find(investmentType => investmentType.id === investment.type)!;
        navigate(getEditInvestmentUrl(investmentType.slug, investmentId));
    }, [navigate, allInvestments, investmentTypes]);
    
    const handleDeleteInvestmentClick = useCallback((investmentId: InvestmentId) => {
        const investment = rows.find(investment => investment.id === investmentId);
        if (!investment || ("showInSidebar" in investment)) {
            return;
        }
        setInvestmentToDelete(investment);
        setDeleteConfirmInvestmentName(investment.name);
        setIsInvestmentDeleteConfirmOpen(true);
    }, [rows]);
    
    const handleDeleteInvestmentConfirmClick = async () => {
        const investmentId = investmentToDelete!.id;
        setIsProcessing(true);
        try {
            const result = await dispatch(removeInvestmentAsync({ investmentId, api }));
            if (result.meta.requestStatus === "rejected") {
                throw "error" in result ? result.error : new Error();
            }
            dispatch(showUserMessage({
                type: "success",
                message: t("page.investments.deleteInvestmentConfirm.result.success", { name: investmentToDelete!.name }),
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
        setInvestmentToDelete(null);
        setIsInvestmentDeleteConfirmOpen(false);
    };
    
    const handleDeleteInvestmentCancelClick = () => {
        setInvestmentToDelete(null);
        setIsInvestmentDeleteConfirmOpen(false);
    };
    
    const handleDeleteInvestmentClose = () => {
        setInvestmentToDelete(null);
        setIsInvestmentDeleteConfirmOpen(false);
    };
    
    const handleCreateInvestmentClick = () => {
        navigate(getCreateInvestmentUrl(investmentTypeSlug));
    };
    
    const columns: GridColDef[] = useMemo(() => [
        {
            field: "name",
            headerName: t("page.investments.table.name"),
            flex: 1,
            sortable: investmentTypeSlug !== "all",
            filterable: investmentTypeSlug !== "all",
            renderCell: params => {
                return (
                    <>
                        {params.row.rowType === "investmentType" &&
                            <Link to={getViewInvestmentTypeUrl(params.row.id)}>
                                {params.row.isPredefined ? t(`common.investmentTypes.${params.value}` as any) : params.value}
                            </Link>
                        }
                        {params.row.rowType === "investment" &&
                            <Link to={getViewInvestmentUrl(params.row.type, params.row.id)}>
                                {params.value}
                            </Link>
                        }
                    </>
                );
            },
        },
        {
            field: "currentValue",
            headerName: t("page.investments.table.currentValue"),
            width: 250,
            sortable: investmentTypeSlug !== "all",
            filterable: investmentTypeSlug !== "all",
            cellClassName: "Investments__cell--currentValue",
            align: "right",
            renderCell: params => {
                return (
                    <>
                        {params.row.rowType === "investment" && <NumberView num={params.value} currency={params.row.purchase.currency} />}
                    </>
                );
            },
        },
        {
            field: "endDate",
            headerName: t("page.investments.table.endDate"),
            width: 250,
            sortable: investmentTypeSlug !== "all",
            filterable: investmentTypeSlug !== "all",
            renderCell: params => {
                return (
                    <>
                        {params.row.rowType === "investment" && <DateTime timestamp={params.value ?? 0} showDate={true} />}
                    </>
                );
            },
        },
        {
            field: "id",
            headerName: t("page.investments.table.actions"),
            width: 200,
            sortable: investmentTypeSlug !== "all",
            filterable: investmentTypeSlug !== "all",
            renderCell: params => {
                return (
                    <>
                        {params.row.rowType === "investment" && (
                            <>
                                <Button variant="contained" onClick={() => handleViewInvestmentClick(params.row.id)}>
                                    <FontAwesomeIcon icon={faSolid.faEye} />
                                </Button>
                                <Button variant="contained" onClick={() => handleEditInvestmentClick(params.row.id)}>
                                    <FontAwesomeIcon icon={faSolid.faPen} />
                                </Button>
                                <Button variant="contained" color="warning" onClick={() => handleDeleteInvestmentClick(params.row.id)} disabled={params.row.isPredefined || params.row.numInvestments > 0}>
                                    <FontAwesomeIcon icon={faSolid.faTrash} />
                                </Button>
                            </>
                        )}
                    </>
                )
            },
        },
    ], [handleDeleteInvestmentClick, handleEditInvestmentClick, handleViewInvestmentClick, investmentTypeSlug, t]);
    
    return (
        <Page className="Investments">
            {investmentType && 
                <PageHeader
                    title={investmentType.isPredefined ? t(`common.investmentTypes.${investmentType.name}` as any) : investmentType.name}
                    icon={<FontAwesomeIcon icon={investmentType.icon} />}
                />
            }
            {!investmentType && 
                <PageHeader
                    title={t("common.investmentTypes.all")}
                    icon={<FontAwesomeIcon icon={faSolid.faBook} />}
                />
            }
            <PageContent>
                {investmentTypeSlug !== "all" && (
                    <>
                        <Button
                            variant="contained"
                            startIcon={<FontAwesomeIcon icon={faSolid.faPlus} />}
                            sx={{ marginBottom: 3 }}
                            onClick={() => handleCreateInvestmentClick()}
                        >
                            {t("page.investments.createInvestment")}
                        </Button>
                        <Button
                            className="Investments__refresh-button"
                            variant="text"
                            sx={{ marginBottom: 3, minWidth:0 }}
                            onClick={() => handleRefreshClick()}
                        >
                            <FontAwesomeIcon icon={faSolid.faRefresh} />
                        </Button>
                    </>
                )}
                <DataGrid
                    rows={rows}
                    columns={columns}
                    pageSize={investmentTypeSlug === "all" ? 100 : 50}
                    rowsPerPageOptions={investmentTypeSlug === "all" ? [100] : [10, 20, 50, 100]}
                    disableSelectionOnClick
                    autoHeight={true}
                    getRowClassName={params => params.row.rowType === "investmentType" ? "Investments__row--investmentType" : "Investments__row--investment"}
                />
            </PageContent>
            <Dialog
                open={isInvestmentDeleteConfirmOpen}
                onClose={() => handleDeleteInvestmentClose()}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogContent id="alert-dialog-title" sx={{ margin: 3, marginBottom: 0 }}>
                    <DialogContentText>
                        {t("page.investments.deleteInvestmentConfirm.text", { name: deleteConfirmInvestmentName })}
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ margin: 3 }}>
                    <Button variant="contained" color="warning" onClick={() => handleDeleteInvestmentConfirmClick()} autoFocus>{t("common.buttons.yes")}</Button>
                    <Button onClick={() => handleDeleteInvestmentCancelClick()}>{t("common.buttons.no")}</Button>
                </DialogActions>
            </Dialog>
            {(isLoading || isProcessing || isRefreshing) && <LoadingIndicator />}
        </Page>
    );
}
