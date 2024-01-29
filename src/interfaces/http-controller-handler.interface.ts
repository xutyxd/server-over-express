
import { Request } from "express";

import { HttpMethodEnum } from "../enums/http-method.enum";
import { IHTTPContextData } from "./http-context-data.interface";

export interface IHTTPControllerHandler<T> {
    path: {
        method: HttpMethodEnum;
        relative?: string;
    },
    action: (request: Request, context: IHTTPContextData) => Promise<T>
}