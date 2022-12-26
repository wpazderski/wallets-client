import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { useAppSelector } from "../../../../../../../app/store";
import { selectWalletsList, WalletId } from "../../../../../../../app/store/WalletsSlice";
import { FormField } from "../../../../../common/formField/FormField";





export interface InvestmentWalletIdFieldProps {
    value: WalletId;
    onChange: (value: WalletId) => void;
    createValidator: (validate: () => boolean, validatorName: "walletId") => void;
}

export function InvestmentWalletIdField(props: InvestmentWalletIdFieldProps) {
    const { t } = useTranslation();
    const wallets = useAppSelector(selectWalletsList);
    const [walletId, setWalletIdType] = useState(props.value);
    
    const onChange = props.onChange;
    
    const handleWalletIdChange = (type: WalletId) => {
        setWalletIdType(type);
    };
    
    const validateField = useCallback(() => {
        return true;
    }, []);
    
    useEffect(() => {
        props.createValidator(validateField, "walletId");
    }, [props, validateField]);
    
    useEffect(() => {
        onChange(walletId);
    }, [onChange, walletId]);
    
    return (
        <FormField title={t("common.investments.fields.walletId")}>
            <FormControl>
                <InputLabel id="investment-walletId-type-label">{t("common.investments.fields.walletId")}</InputLabel>
                <Select
                    label={t("common.investments.fields.walletId")}
                    labelId="investment-walletId-type-label"
                    value={walletId}
                    onChange={event => handleWalletIdChange(event.target.value as WalletId)}
                    sx={{ width: "100%" }}
                >
                    {wallets.map(wallet => <MenuItem key={wallet.id} value={wallet.id}>{wallet.isPredefined ? t(wallet.name as any) : wallet.name}</MenuItem>)}
                </Select>
            </FormControl>
        </FormField>
    );
}
