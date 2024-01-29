
import http, { Server } from 'http';

import express, { Application, Router, Request, Response } from "express";
import * as bodyParser from 'body-parser';
import { IHTTPHeader } from '../interfaces/http-header.interface';
import { IHTTPController } from '../interfaces/http-controller.interface';
import { IHTTPIntermediateAction } from '../interfaces/http-action-intermediate.interface';
import { IHTTPContextData } from '../interfaces/http-context-data.interface';

export class HttpServer {

    private router: Router;
    private server: Server;
    private Headers: IHTTPHeader[] = [];
    private Request = {
        before: <IHTTPIntermediateAction[]>[],
        after: <IHTTPIntermediateAction[]>[]
    }

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

    public controllers = {
        add: (controller: IHTTPController, base = '') => {
            const { path, controllers = [ ], handlers } = controller;
            // Register all subcontrollers
            controllers.forEach((controller) => this.controllers.add(controller));
            // Register handlers
            handlers.forEach(({ path: { relative, method }, action }) => {
                const absolute = `${base}/${path}${relative && '/' + relative}`;
                this.handle(absolute, method, action);
            })
        }
    }

    public request = {
        before: {
            add: (action: IHTTPIntermediateAction) => {
                this.Request.before.push(action);
            },
            remove: (fn: IHTTPIntermediateAction['execute']) => {
                this.Request.before = this.Request.before.filter(({ execute }) => execute.toString() !== fn.toString());
            }
        },
        after: {
            add: (action: IHTTPIntermediateAction) => {
                this.Request.after.push(action);
            },
            remove: (fn: IHTTPIntermediateAction['execute']) => {
                this.Request.after = this.Request.after.filter(({ execute }) => execute.toString() !== fn.toString());
            }
        }
    }

    private async execute(request: Request, context: IHTTPContextData, action: IHTTPIntermediateAction): Promise<void> {
        const { originalUrl: url } = request;
        const { paths: { include, exclude } = { }, execute: fn } = action;

        let execute = false;

        if(include || exclude) {
            const included = (include || [ ]).some((path) => url.includes(path));
            const excluded = (exclude || [ ]).some((path) => url.includes(path));

            execute = included && !excluded;

            if (!execute) {
                const includes = (include || []).filter((path) => url.includes(path)).reduce((a, b) => a.length > b.length ? a : b, '');
                const excludes = (exclude || []).filter((path) => url.includes(path)).reduce((a, b) => a.length > b.length ? a : b, '');
                // If path is included and excluded, check which is more accurate
                execute = includes.length > excludes.length;
            }
        }

        if (!execute) {
            return;
        }

        let result: Error | void;

        try {
            result = await fn(request, context);
        } catch(e) {
            result = <Error>e;
        }

        if(result && result instanceof Error) {
            throw result;
        }
    }
}