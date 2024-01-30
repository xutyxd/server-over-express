
import { IHTTPContextData } from "./http-context-data.interface";
import { IHTTPResponse } from "./http-response.interface";

export interface IHttpResponseConstructor {
    new (response: unknown, data: IHTTPContextData): IHTTPResponse;
}