
import http, { Server } from 'http';

import express, { Application, Router, Request, Response } from "express";
import * as bodyParser from 'body-parser';
import { IHTTPHeader } from '../interfaces/http-header.interface';

export class HttpServer {

    private router: Router;
    private server: Server;
    private Headers: IHTTPHeader[] = [];

    constructor(port = 80, responseCtor?: any) {
        const app = express();
        const router = this.router = Router();
        const server = this.server = http.createServer(app);
        // Parse application/x-www-form-urlencoded
        app.use(bodyParser.urlencoded({ extended: false }));
        // Parse application/json
        app.use(bodyParser.json());
        // Pass router to listen all paths
        app.use('/', router);
        // Start listening server
        server.listen(port);
    }

    public headers = {
        add: (header: IHTTPHeader): void => {
            this.Headers.push(header)
        },
        get: (): IHTTPHeader[] => {
            return [ ...this.Headers ];    
        },
        remove: (header: string): void => {
            this.Headers = this.Headers.filter(({ key }) => key !== header);
        }
    }
}