
import { ReadStream } from 'node:fs';
import { IHTTPHeader } from "./http-header.interface";


export interface IHTTPResponse {
    code: number;
    headers: IHTTPHeader[];
    stream?: ReadStream;
    data?: unknown;
}