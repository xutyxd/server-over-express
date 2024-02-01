
import { ReadStream } from 'node:fs';

import { IHTTPContextData } from "../interfaces/http-context-data.interface";
import { IHTTPHeader } from '../interfaces/http-header.interface';
import { IHTTPResponse } from '../interfaces/http-response.interface';

export class HTTPResponse implements IHTTPResponse {

    public code: number = 200;
    public headers: IHTTPHeader[] = [ ];
    public stream?: ReadStream;
    public data?: unknown;
    public timestamp: number;

    constructor(response: unknown, context: IHTTPContextData) {
        const { code, stream, headers } = context;

        this.code = code;
        this.headers = headers;

        this.data = response;

        if (response instanceof Error) {
            this.data = response.message;
        }

        this.stream = stream;
        this.timestamp = new Date().getTime();
    }
}