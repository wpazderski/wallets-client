type ElementType < T extends ReadonlyArray < unknown > > = T extends ReadonlyArray<infer ElementType> ? ElementType : never;

export const genericServerErrors = {
    "400 Bad Request": "badRequest",
    "403 Forbidden": "forbidden",
    "404 Not Found": "notFound",
    "409 Conflict": "conflict",
    "500 Internal Server Error": "internalServerError",
} as const;

export const detailedServerErrors = [
    "userAlreadyExists",
    "userLoginAlreadyExists",
    "invalidUserRole",
    "numberOfEntriesLimit",
    "dbSizeLimit",
    "keyReservedForInternalUsage",
    "invalidLoginData",
    "firstUserMustBeAdmin",
    "onlyAdminsCanUpdateOtherUsers",
    "onlyAdminsCanUpdateLogins",
    "cantUpdateOwnRole",
    "cantUpdateSomeoneElsesPassword",
    "cantUpdateSomeoneElsesPrivateData",
    "cantDeleteSelf",
] as const;

export type GenericServerError = typeof genericServerErrors[keyof typeof genericServerErrors];
export type DetailedServerError = ElementType<typeof detailedServerErrors>;
export type ServerError = GenericServerError | DetailedServerError | "unknown";

export function resolveServerError(error: any): ServerError {
    if (!("message" in error)) {
        return "unknown";
    }
    const message = `${error.message}`;
    for (const serverError of detailedServerErrors) {
        if (message.includes(`(${serverError})`)) {
            return serverError;
        }
    }
    for (const serverError in genericServerErrors) {
        if (message.includes(`${serverError}`)) {
            return genericServerErrors[serverError as keyof typeof genericServerErrors];
        }
    }
    return "unknown";
}
