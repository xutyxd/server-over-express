import { ReadStream } from 'node:fs';
import { Request, Response } from "express";
import Cookies from "cookies";
import { IHTTPContextData } from "../interfaces/http-context-data.interface";
import { IHTTPHeader } from "../interfaces/http-header.interface";

export class HTTPContextData implements IHTTPContextData {
    
    private Request: Request;
    private Response: Response;
    private Cookies?: Cookies;
    
    public code: number;
    public headers: IHTTPHeader[];
    public stream?: ReadStream;
    public keys: string[];

    constructor(request: Request, response: Response, context?: Partial<IHTTPContextData>, ) {
        this.Request = request;
        this.Response = response;

        this.code = context?.code || 200;
        this.headers = context?.headers || [];
        this.stream = context?.stream;
        this.keys = context?.keys || [];
        this.Cookies = context?.cookies;
    }

    public get cookies() {
        if (!this.Cookies) {
            this.Cookies = new Cookies(this.Request, this.Response, {
                keys: this.keys,
                secure: this.Request.secure
            })
        }

        return this.Cookies;
    }

    public set cookies(cookies: Cookies) {
        this.Cookies = cookies;
    }
}