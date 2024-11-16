
import { Readable } from 'node:stream';
import { IHTTPHeader } from "./http-header.interface";


export interface IHTTPResponse {
    code: number;
    headers: IHTTPHeader[];
    stream?: Readable;
    data?: unknown;

    reply(): unknown
}