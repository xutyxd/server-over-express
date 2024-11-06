
import { ReadStream } from 'node:fs';
import { IHTTPHeader } from "./http-header.interface";
import Cookies from 'cookies';
import busboy from 'busboy';

export interface IHTTPContextData {
    code: number,
    headers: IHTTPHeader[],
    stream?: ReadStream;
    keys: string[];
    cookies: Cookies;
    files: busboy.Busboy;
    [any: string]: any
}