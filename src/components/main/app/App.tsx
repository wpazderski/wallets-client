import "./App.scss";

import { ArcElement, BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from "chart.js";
import { ChoroplethController, ColorScale, GeoFeature, ProjectionScale } from "chartjs-chart-geo";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { BrowserRouter as Router } from "react-router-dom";

import { UserSessionManager } from "../../../app";
import { useApiContext } from "../../../app/ApiContext";
import { store, useAppDispatch, useAppSelector } from "../../../app/store";
import { loadAppInfoAsync, selectLoadingState } from "../../../app/store/AppInfoSlice";
import { LoadingIndicator } from "../common/loadingIndicator/LoadingIndicator";
import { AppMain } from "./appMain/AppMain";
import { AppSidebar } from "./appSidebar/AppSidebar";





ChartJS.register(
    ArcElement,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ChoroplethController,
    GeoFeature,
    ColorScale,
    ProjectionScale,
);

export function App() {
    const { t } = useTranslation();
    const api = useApiContext();
    const dispatch = useAppDispatch();
    const loadingState = useAppSelector(selectLoadingState);
    
    useEffect(() => {
        if (loadingState === "not-loaded") {
            dispatch(loadAppInfoAsync(api));
        }
    });
    
    useEffect(() => {
        document.title = t("appTitle");
    }, [t]);
    
    useEffect(() => {
        const handleApiRequestError = (error: Error) => {
            const storeState = store.getState();
            if (storeState.user.role !== "unauthorized" && storeState.user.isFullyLoaded && error.message.includes("401 Unauthorized")) {
                UserSessionManager.resetUserDependantStores();
            }
        };
        api.setRequestErrorHandler(handleApiRequestError);
    }, [api]);
    
    
    return (
        <Router>
            <div className="App">
                {loadingState === "loaded" &&
                    <>
                        <AppSidebar />
                        <AppMain />
                    </>
                }
                {loadingState !== "loaded" && 
                    <>
                        <LoadingIndicator />
                    </>
                }
            </div>
        </Router>
    );
}
