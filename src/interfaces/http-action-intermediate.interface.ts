import { Request } from "express";
import { IHTTPContextData } from "./http-context-data.interface";

export interface IHTTPIntermediateAction {
    execute: (request: Request, context: IHTTPContextData) => Promise<Error | void> | Error | void;
    paths?: {
        include?: string[],
        exclude?: string[]
    }
}