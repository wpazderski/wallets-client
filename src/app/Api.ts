import * as kvapi from "@wpazderski/kvapi-client";

import { ExternalDataApi } from "./ExternalDataApi";





export class Api extends kvapi.Api {
    
    private _externalDataApi: ExternalDataApi;
    
    get externalData(): ExternalDataApi {
        return this._externalDataApi;
    }
    
    private requestErrorHandler: (error: Error) => void = () => {};
    
    constructor(batchMode: boolean = false) {
        super(
            "/api",
            {
                e2ee: true,
                batchMode,
                onRequestError: error => this.requestErrorHandler(error),
            },
        );
        this._externalDataApi = new ExternalDataApi(this.genericApi);
    }
    
    override createBatchedApi(): Api {
        return new Api(true);
    }
    
    setRequestErrorHandler(handler: (error: Error) => void): void {
        this.requestErrorHandler = handler;
    }
    
}
