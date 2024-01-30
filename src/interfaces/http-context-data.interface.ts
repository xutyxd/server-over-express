
import { ReadStream } from 'node:fs';
import { IHTTPHeader } from "./http-header.interface";

export interface IHTTPContextData {
    code: number,
    headers: IHTTPHeader[],
    stream?: ReadStream;
    [any: string]: any
}