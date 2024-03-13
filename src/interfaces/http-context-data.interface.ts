
import { ReadStream } from 'node:fs';
import { IHTTPHeader } from "./http-header.interface";
import Cookies from 'cookies';

export interface IHTTPContextData {
    code: number,
    headers: IHTTPHeader[],
    stream?: ReadStream;
    keys: string[];
    cookies: Cookies;
    [any: string]: any
}