import "./AppSidebar.scss";

import * as faSolid from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { resolveServerError, UserSessionManager } from "../../../../app";
import { useApiContext } from "../../../../app/ApiContext";
import { useAppDispatch, useAppSelector, userSlice } from "../../../../app/store";
import { selectHasAnyUsers } from "../../../../app/store/AppInfoSlice";
import { showUserMessage, UserMessageDuration } from "../../../../app/store/AppSlice";
import { selectInvestmentTypesList } from "../../../../app/store/InvestmentTypesSlice";
import { LoadingIndicator } from "../../common/loadingIndicator/LoadingIndicator";
import { SidebarNavLink } from "./sidebarNavLink/SidebarNavLink";





export function AppSidebar() {
    const { t } = useTranslation();
    const api = useApiContext();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const appHasAnyUsers = useAppSelector(selectHasAnyUsers);
    const userRole = useAppSelector(userSlice.selectUserRole);
    const userLastPasswordUpdateTimestamp = useAppSelector(userSlice.selectUserLastPasswordUpdateTimestamp);
    const userIsFullyLoaded = useAppSelector(userSlice.selectUserIsFullyLoaded);
    const investmentTypes = useAppSelector(selectInvestmentTypesList);
    const [isProcessing, setIsProcessing] = useState(false);
    
    const handleLogoutClick = useCallback(async () => {
        setIsProcessing(true);
        try {
            await UserSessionManager.signOut(api);
            navigate("/");
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
        setIsProcessing(false);
    }, [api, dispatch, navigate, t]);
    
    return (
        <div className="AppSidebar">
            <header>
                <FontAwesomeIcon icon={faSolid.faWallet} />
                <span>{t("appTitle")}</span>
            </header>
            <nav>
                <ul>
                    {(userLastPasswordUpdateTimestamp === null || userLastPasswordUpdateTimestamp > 0) && (
                        <>
                            {(userRole === "unauthorized" || !userIsFullyLoaded) && !appHasAnyUsers && 
                                <>
                                    <li><SidebarNavLink to="/"><FontAwesomeIcon fixedWidth={true} icon={faSolid.faUserPlus} /> <span>{t("page.createFirstUser")}</span></SidebarNavLink></li>
                                </>
                            }
                            {(userRole === "unauthorized" || !userIsFullyLoaded) && appHasAnyUsers && 
                                <>
                                    <li><SidebarNavLink to="/"><FontAwesomeIcon fixedWidth={true} icon={faSolid.faSignIn} /> <span>{t("page.signIn")}</span></SidebarNavLink></li>
                                </>
                            }
                            {userRole !== "unauthorized" && userIsFullyLoaded &&
                                <>
                                    <li className="AppSidebar__separator"></li>
                                    <li className="AppSidebar__header">{t("sidebar.section.wallets")}</li>
                                    <li><SidebarNavLink to="/" matchWholePath={true}><FontAwesomeIcon fixedWidth={true} icon={faSolid.faChartPie} /> <span>{t("page.summary")}</span></SidebarNavLink></li>
                                    <li><SidebarNavLink to="/wallets"><FontAwesomeIcon fixedWidth={true} icon={faSolid.faWallet} /> <span>{t("page.wallets")}</span></SidebarNavLink></li>
                                    <li className="AppSidebar__separator"></li>
                                    <li className="AppSidebar__header">{t("sidebar.section.investments")}</li>
                                    <li><SidebarNavLink to="/investmentTypes"><FontAwesomeIcon fixedWidth={true} icon={faSolid.faFolder} /> <span>{t("page.investmentTypes")}</span></SidebarNavLink></li>
                                    <li><SidebarNavLink to="/investments/all"><FontAwesomeIcon fixedWidth={true} icon={faSolid.faBook} /> <span>{t("page.allInvestments")}</span></SidebarNavLink></li>
                                    {investmentTypes.filter(investmentType => investmentType.showInSidebar).map(investmentType => (
                                        <li key={investmentType.id}>
                                            <SidebarNavLink to={`/investments/${investmentType.slug}`}>
                                                <FontAwesomeIcon fixedWidth={true} icon={investmentType.icon} />
                                                <span>{investmentType.isPredefined ? t(`common.investmentTypes.${investmentType.name}` as any) : investmentType.name}</span>
                                            </SidebarNavLink>
                                        </li>
                                    ))}
                                </>
                            }
                            {userRole === "admin" && userIsFullyLoaded &&
                                <>
                                    <li className="AppSidebar__separator"></li>
                                    <li className="AppSidebar__header">{t("sidebar.section.appManagement")}</li>
                                    <li><SidebarNavLink to="/users"><FontAwesomeIcon fixedWidth={true} icon={faSolid.faUsers} /> <span>{t("page.usersList")}</span></SidebarNavLink></li>
                                </>
                            }
                            {userRole !== "unauthorized" && userIsFullyLoaded &&
                                <>
                                    <li className="AppSidebar__separator"></li>
                                    <li className="AppSidebar__header">{t("sidebar.section.myAccount")}</li>
                                    <li><SidebarNavLink to="/userSettings"><FontAwesomeIcon fixedWidth={true} icon={faSolid.faUserGear} /> <span>{t("page.userSettings")}</span></SidebarNavLink></li>
                                    <li><SidebarNavLink to="/logout" onClick={handleLogoutClick}><FontAwesomeIcon fixedWidth={true} icon={faSolid.faSignOut} /> <span>{t("page.signOut")}</span></SidebarNavLink></li>
                                </>
                            }
                        </>
                    )}
                    {!(userLastPasswordUpdateTimestamp === null || userLastPasswordUpdateTimestamp > 0) && (
                        <>
                            <li><SidebarNavLink to="/logout" onClick={handleLogoutClick}><FontAwesomeIcon fixedWidth={true} icon={faSolid.faSignOut} /> <span>{t("page.signOut")}</span></SidebarNavLink></li>
                        </>
                    )}
                </ul>
            </nav>
            {isProcessing && <LoadingIndicator />}
        </div>
    );
}
