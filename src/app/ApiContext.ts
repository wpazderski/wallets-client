import { createContext, useContext } from "react";

import { Api } from "./Api";

export const ApiContext = createContext<Api | null>(null);

export const useApiContext = () => {
    const apiContext = useContext(ApiContext);
    if (!apiContext) {
        throw new Error("ApiContext not available");
    }
    return apiContext;
};
