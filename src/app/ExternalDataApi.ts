import * as KvapiClient from "@wpazderski/kvapi-client";
import * as Types from "@wpazderski/wallets-types";

export class ExternalDataApi {
    
    constructor(private genericApi: KvapiClient.GenericApi) {
    }
    
    async get(request: Types.api.externalData.GetExternalDataRequest): Promise<Types.api.externalData.GetExternalDataResponse> {
        const response: Types.api.externalData.GetExternalDataResponse = await this.genericApi.post("external-data", request);
        return response;
    }
    
}
