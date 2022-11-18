import "./AppMain.scss";

import { Route, Routes } from "react-router-dom";

import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";

import { appSlice, useAppDispatch, useAppSelector, userSlice } from "../../../../app/store";
import { selectHasAnyUsers } from "../../../../app/store/AppInfoSlice";
import { hideUserMessage } from "../../../../app/store/AppSlice";
import { InvestmentDetails } from "../pages/investments/investmentDetails/InvestmentDetails";
import { InvestmentForm } from "../pages/investments/investmentForm/InvestmentForm";
import { Investments } from "../pages/investments/Investments";
import { InvestmentTypeDetails } from "../pages/investmentTypes/investmentTypeDetails/InvestmentTypeDetails";
import { InvestmentTypeForm } from "../pages/investmentTypes/investmentTypeForm/InvestmentTypeForm";
import { InvestmentTypes } from "../pages/investmentTypes/InvestmentTypes";
import { SignIn } from "../pages/signIn/SignIn";
import { Summary } from "../pages/summary/Summary";
import { UserSettings } from "../pages/userSettings/UserSettings";
import { CreateFirstUser } from "../pages/usersList/createFirstUser/CreateFirstUser";
import { UserCreate } from "../pages/usersList/userCreate/UserCreate";
import { UserEdit } from "../pages/usersList/userEdit/UserEdit";
import { UsersList } from "../pages/usersList/UsersList";
import { WalletDetails } from "../pages/wallets/walletDetails/WalletDetails";
import { Wallets } from "../pages/wallets/Wallets";

export function AppMain() {
    const dispatch = useAppDispatch();
    const appHasAnyUsers = useAppSelector(selectHasAnyUsers);
    const userRole = useAppSelector(userSlice.selectUserRole);
    const userLastPasswordUpdateTimestamp = useAppSelector(userSlice.selectUserLastPasswordUpdateTimestamp);
    const userIsFullyLoaded = useAppSelector(userSlice.selectUserIsFullyLoaded);
    const userMessages = useAppSelector(appSlice.selectUserMessages);
    
    const handleAlertClick = (userMessageId: number) => {
        dispatch(hideUserMessage(userMessageId));
    };
    
    return (
        <div className="AppMain">
            <Routes>
                {(userLastPasswordUpdateTimestamp === null || userLastPasswordUpdateTimestamp > 0) && (
                    <>
                        {(userRole === "unauthorized" || !userIsFullyLoaded) && !appHasAnyUsers && 
                            <>
                                <Route path="/*" element={<CreateFirstUser />} />
                            </>
                        }
                        {(userRole === "unauthorized" || !userIsFullyLoaded) && appHasAnyUsers && 
                            <>
                                <Route path="/*" element={<SignIn />} />
                            </>
                        }
                        {userRole !== "unauthorized" && userIsFullyLoaded &&
                            <>
                                <Route path="/" element={<Summary />} />
                                <Route path="/wallets" element={<Wallets />} />
                                <Route path="/wallets/:walletId" element={<WalletDetails />} />
                                <Route path="/userSettings" element={<UserSettings />} />
                                <Route path="/investmentTypes" element={<InvestmentTypes />} />
                                <Route path="/investmentTypes/:investmentTypeId" element={<InvestmentTypeDetails />} />
                                <Route path="/investmentTypes/:investmentTypeId/edit" element={<InvestmentTypeForm />} />
                                <Route path="/investmentTypes/create" element={<InvestmentTypeForm />} />
                                <Route path="/investments/:investmentTypeSlug" element={<Investments />} />
                                <Route path="/investments/:investmentTypeSlug/:investmentId" element={<InvestmentDetails />} />
                                <Route path="/investments/:investmentTypeSlug/:investmentId/edit" element={<InvestmentForm />} />
                                <Route path="/investments/:investmentTypeSlug/create" element={<InvestmentForm />} />
                            </>
                        }
                        {userRole === "admin" && userIsFullyLoaded &&
                            <>
                                <Route path="/users" element={<UsersList />} />
                                <Route path="/users/create" element={<UserCreate />} />
                                <Route path="/users/:userId/edit" element={<UserEdit />} />
                            </>
                        }
                    </>
                )}
                {!(userLastPasswordUpdateTimestamp === null || userLastPasswordUpdateTimestamp > 0) && (
                    <>
                        <Route path="/*" element={<UserSettings forSettingPassword={true} />} />
                    </>
                )}
            </Routes>
            <Snackbar
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                open={userMessages.length > 0}
            >
                <div className="AppMain__snackbar-alerts-container">
                    {userMessages.map(userMessage =>
                        <Alert
                            severity={userMessage.type}
                            variant="filled"
                            key={userMessage.id}
                            onClick={() => handleAlertClick(userMessage.id)}
                        >
                            {userMessage.message}
                        </Alert>
                    )}
                </div>
            </Snackbar>
        </div>
    );
}
