import "./index.scss";

import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";

import { createTheme, ThemeProvider } from "@mui/material/styles";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";

import { Api } from "./app/Api";
import { ApiContext } from "./app/ApiContext";
import { init as initI18n } from "./app/i18n/init";
import { store } from "./app/store/Store";
import { App } from "./components/main/app/App";

initI18n();

const container = document.getElementById("root")!;
const root = createRoot(container);

const theme = createTheme({
    palette: {
        primary: {
            main: "#1c6697",
        },
    },
});

root.render(
    <React.StrictMode>
        <Provider store={store}>
            <ApiContext.Provider value={new Api()}>
                <LocalizationProvider dateAdapter={AdapterMoment}>
                    <ThemeProvider theme={theme}>
                        <App />
                    </ThemeProvider>
                </LocalizationProvider>
            </ApiContext.Provider>
        </Provider>
    </React.StrictMode>
);
