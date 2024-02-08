
import { Request as HTTPRequest } from "express";

import { HttpMethodEnum } from "../enums/http-method.enum";
import { IHTTPContextData } from "./http-context-data.interface";

export interface IHTTPControllerHandler<T> {
    path: {
        method: HttpMethodEnum;
        relative?: string;
    },
    action: (request: HTTPRequest, context: IHTTPContextData) => Promise<T>
}