import "./Wallets.scss";

import * as faSolid from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import { DataGrid, GridColDef, GridValueGetterParams } from "@mui/x-data-grid";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { resolveServerError, useApiContext } from "../../../../../app";
import { useAppDispatch, useAppSelector } from "../../../../../app/store";
import { showUserMessage, UserMessageDuration } from "../../../../../app/store/AppSlice";
import { selectExternalData } from "../../../../../app/store/ExternalDataSlice";
import { selectInvestmentsList } from "../../../../../app/store/InvestmentsSlice";
import { selectUserSettings } from "../../../../../app/store/UserSettingsSlice";
import {
    addWalletAsync,
    removeWalletAsync,
    selectWalletsList,
    updateWalletAsync,
    Wallet,
    WalletDescription,
    WalletId,
    WalletName,
} from "../../../../../app/store/WalletsSlice";
import { Calculator } from "../../../../../app/valueCalculation";
import { CurrencyConverter } from "../../../../../app/valueCalculation/CurrencyConverter";
import { LoadingIndicator } from "../../../common/loadingIndicator/LoadingIndicator";
import { NumberView } from "../../../common/numberView/NumberView";
import { Page } from "../../page/Page";
import { PageContent } from "../../pageContent/PageContent";
import { PageHeader } from "../../pageHeader/PageHeader";





interface Row extends Wallet {
    numInvestments: number;
    investmentsValue: number;
}

export function getWalletsListUrl(): string {
    return "/wallets";
}

export function getViewWalletUrl(walletId: WalletId): string {
    return `/wallets/${walletId}`;
}

export function Wallets() {
    const { t } = useTranslation();
    const api = useApiContext();
    const dispatch = useAppDispatch();
    const externalData = useAppSelector(selectExternalData);
    const userSettings = useAppSelector(selectUserSettings);
    const wallets = useAppSelector(selectWalletsList);
    const investments = useAppSelector(selectInvestmentsList);
    const [isProcessing, setIsProcessing] = useState(false);
    const [walletToDelete, setWalletToDelete] = useState<Wallet | null>(null);
    const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
    const [formState, setFormState] = useState<"create-wallet" | "edit-wallet">("create-wallet");
    const [formWalletId, setFormWalletId] = useState<WalletId>("" as WalletId);
    const [formWalletName, setFormWalletName] = useState<WalletName>("" as WalletName);
    const [formWalletDescription, setFormWalletDescription] = useState<WalletDescription>("" as WalletDescription);
    const [deleteConfirmWalletName, setDeleteConfirmWalletName] = useState("");
    const [isWalletDeleteConfirmOpen, setIsWalletDeleteConfirmOpen] = useState(false);
    
    const mainCurrencyId = userSettings.mainCurrencyId;
    
    const rows: Row[] = useMemo(() => {
        return wallets.map(wallet => ({
            ...wallet,
            numInvestments: investments.filter(investment => investment.walletId === wallet.id).length,
            investmentsValue: investments
                .filter(investment => investment.walletId === wallet.id)
                .map(investment => {
                    const value = new Calculator(investment, externalData, userSettings).calculate();
                    return CurrencyConverter.convert(value, investment.purchase.currency, userSettings.mainCurrencyId, externalData);
                })
                .reduce((sum, value) => sum + value, 0),
        }));
    }, [wallets, investments, externalData, userSettings]);
    
    const handleChangeName = (name: WalletName) => {
        setFormWalletName(name);
    };
    const handleChangeDescription = (description: WalletDescription) => {
        setFormWalletDescription(description);
    };
    
    const handleEditWalletClick = useCallback((walletId: string) => {
        const wallet = wallets.find(wallet => wallet.id === walletId);
        if (!wallet) {
            return;
        }
        setFormWalletId(wallet.id);
        setFormWalletName(wallet.name);
        setFormWalletDescription(wallet.description);
        setFormState("edit-wallet");
        setIsFormOpen(true);
    }, [wallets]);
    
    const handleCreateWalletClick = () => {
        setFormWalletId("" as WalletId);
        setFormWalletName("" as WalletName);
        setFormWalletDescription("" as WalletDescription);
        setFormState("create-wallet");
        setIsFormOpen(true);
    };
    
    const handleCancelFormClick = () => {
        setIsFormOpen(false);
    };
    
    const handleSaveFormClick = () => {
        if (formState === "create-wallet") {
            createWallet();
        }
        else if (formState === "edit-wallet") {
            updateWallet();
        }
    };
    
    const createWallet = async () => {
        setIsProcessing(true);
        const wallet: Wallet = {
            id: "" as WalletId,
            name: formWalletName,
            description: formWalletDescription,
            isPredefined: false,
        };
        try {
            const result = await dispatch(addWalletAsync({ wallet, api }));
            if (result.meta.requestStatus === "rejected") {
                throw "error" in result ? result.error : new Error();
            }
            dispatch(showUserMessage({
                type: "success",
                message: t("page.wallets.createWalletConfirm.result.success", { name: wallet!.name }),
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
        setIsProcessing(false);
        setIsFormOpen(false);
    };
    
    const updateWallet = async () => {
        setIsProcessing(true);
        const wallet: Wallet = {
            id: formWalletId,
            name: formWalletName,
            description: formWalletDescription,
            isPredefined: false,
        };
        try {
            const result = await dispatch(updateWalletAsync({ wallet, api }));
            if (result.meta.requestStatus === "rejected") {
                throw "error" in result ? result.error : new Error();
            }
            dispatch(showUserMessage({
                type: "success",
                message: t("page.wallets.updateWalletConfirm.result.success", { name: wallet.name }),
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
        setIsProcessing(false);
        setIsFormOpen(false);
    };
    
    const handleDeleteWalletClick = useCallback((walletId: string) => {
        const wallet = wallets.find(wallet => wallet.id === walletId);
        if (!wallet) {
            return;
        }
        setWalletToDelete(wallet);
        setDeleteConfirmWalletName(wallet.name);
        setIsWalletDeleteConfirmOpen(true);
    }, [wallets]);
    const handleDeleteWalletClose = () => {
        setWalletToDelete(null);
        setIsWalletDeleteConfirmOpen(false);
    };
    const handleDeleteWalletCancelClick = () => {
        setWalletToDelete(null);
        setIsWalletDeleteConfirmOpen(false);
    };
    const handleDeleteWalletConfirmClick = async () => {
        const walletId = walletToDelete!.id;
        setIsProcessing(true);
        try {
            const result = await dispatch(removeWalletAsync({ walletId, api }));
            if (result.meta.requestStatus === "rejected") {
                throw "error" in result ? result.error : new Error();
            }
            dispatch(showUserMessage({
                type: "success",
                message: t("page.wallets.deleteWalletConfirm.result.success", { name: walletToDelete!.name }),
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
        setWalletToDelete(null);
        setIsWalletDeleteConfirmOpen(false);
    };
    
    const columns: GridColDef[] = useMemo(() => [
        {
            field: "name",
            headerName: t("page.wallets.table.name"),
            flex: 1,
            valueGetter: (params: GridValueGetterParams) => params.row.isPredefined ? t(params.value as any) : params.value,
            renderCell: params => {
                return (
                    <Link to={getViewWalletUrl(params.row.id)}>
                        {params.value}
                    </Link>
                );
            },
        },
        {
            field: "description",
            headerName: t("page.wallets.table.description"),
            flex: 2,
            valueGetter: (params: GridValueGetterParams) => params.row.isPredefined ? t(params.value as any) : params.value,
        },
        {
            field: "numInvestments",
            headerName: t("page.wallets.table.numInvestments"),
            width: 150,
        },
        {
            field: "investmentsValue",
            headerName: t("page.wallets.table.investmentsValue"),
            width: 250,
            renderCell: params => {
                return (
                    <NumberView num={params.value} currency={mainCurrencyId} />
                );
            },
        },
        {
            field: "id",
            headerName: t("page.wallets.table.actions"),
            width: 200,
            renderCell: params => {
                return (
                    <>
                        <Button variant="contained" onClick={() => handleEditWalletClick(params.row.id)} disabled={params.row.isPredefined}>
                            <FontAwesomeIcon icon={faSolid.faPen} />
                        </Button>
                        <Button variant="contained" color="warning" onClick={() => handleDeleteWalletClick(params.row.id)} disabled={params.row.isPredefined || params.row.numInvestments > 0}>
                            <FontAwesomeIcon icon={faSolid.faTrash} />
                        </Button>
                    </>
                )
            },
        },
    ], [handleDeleteWalletClick, handleEditWalletClick, mainCurrencyId, t]);
    
    return (
        <Page className="Wallets">
            <PageHeader title={t("page.wallets")} icon={<FontAwesomeIcon icon={faSolid.faWallet} />} />
            <PageContent>
                <Button
                    variant="contained"
                    startIcon={<FontAwesomeIcon icon={faSolid.faFolderPlus} />}
                    sx={{ marginBottom: 3 }}
                    onClick={() => handleCreateWalletClick()}
                >
                    {t("page.wallets.createWallet")}
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
                open={isWalletDeleteConfirmOpen}
                onClose={() => handleDeleteWalletClose()}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogContent id="alert-dialog-title" sx={{ margin: 3, marginBottom: 0 }}>
                    <DialogContentText>
                        {t("page.wallets.deleteWalletConfirm.text", { name: deleteConfirmWalletName })}
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ margin: 3 }}>
                    <Button variant="contained" color="warning" onClick={() => handleDeleteWalletConfirmClick()} autoFocus>{t("common.buttons.yes")}</Button>
                    <Button onClick={() => handleDeleteWalletCancelClick()}>{t("common.buttons.no")}</Button>
                </DialogActions>
            </Dialog>
            <Dialog open={isFormOpen} onClose={() => handleCancelFormClick()}>
                <DialogTitle>{formState === "create-wallet" ? t("page.wallets.form.create") : t("page.wallets.form.edit")}</DialogTitle>
                <DialogContent sx={{ margin: 3, marginBottom: 0 }}>
                    <TextField
                        autoFocus
                        margin="dense"
                        label={t("page.wallets.form.name")}
                        fullWidth
                        variant="standard"
                        onChange={event => handleChangeName(event.target.value as WalletName)}
                        value={formWalletName}
                    />
                    <TextField
                        autoFocus
                        margin="dense"
                        label={t("page.wallets.form.description")}
                        multiline
                        fullWidth
                        variant="standard"
                        rows={4}
                        onChange={event => handleChangeDescription(event.target.value as WalletDescription)}
                        value={formWalletDescription}
                    />
                </DialogContent>
                <DialogActions sx={{ margin: 3 }}>
                    <Button onClick={() => handleSaveFormClick()} variant="contained">{t("page.wallets.form.buttons.save")}</Button>
                    <Button onClick={() => handleCancelFormClick()}>{t("page.wallets.form.buttons.cancel")}</Button>
                </DialogActions>
            </Dialog>
            {isProcessing && <LoadingIndicator />}
        </Page>
    );
}
