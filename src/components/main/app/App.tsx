import "./App.scss";

import { ArcElement, BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Title, Tooltip } from "chart.js";
import { ChoroplethController, ColorScale, GeoFeature, ProjectionScale } from "chartjs-chart-geo";
import React, { useEffect } from "react";
import { BrowserRouter as Router } from "react-router-dom";

import { UserSessionManager } from "../../../app";
import { useApiContext } from "../../../app/ApiContext";
import { useAppDispatch, useAppSelector, userSlice } from "../../../app/store";
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
    const api = useApiContext();
    const dispatch = useAppDispatch();
    const loadingState = useAppSelector(selectLoadingState);
    const userRole = useAppSelector(userSlice.selectUserRole);
    const userIsFullyLoaded = useAppSelector(userSlice.selectUserIsFullyLoaded);
    useEffect(() => {
        if (loadingState === "not-loaded") {
            dispatch(loadAppInfoAsync(api));
        }
    });
    const handleApiRequestError = (error: Error) => {
        if (userRole !== "unauthorized" && userIsFullyLoaded && error.message.includes("401 Unauthorized")) {
            UserSessionManager.resetUserDependantStores();
        }
    };
    api.setRequestErrorHandler(handleApiRequestError);
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
