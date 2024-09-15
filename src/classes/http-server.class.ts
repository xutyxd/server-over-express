
import http, { Server } from 'http';
import { AddressInfo } from 'net';

import express, { Router, Request, Response } from "express";
import * as bodyParser from 'body-parser';
import { IHTTPHeader } from '../interfaces/http-header.interface';
import { IHTTPController } from '../interfaces/http-controller.interface';
import { IHTTPIntermediateAction } from '../interfaces/http-intermediate-action.interface';
import { IHTTPContextData } from '../interfaces/http-context-data.interface';
import { IHTTPControllerHandler } from '../interfaces/http-controller-handler.interface';
import { HttpMethodEnum } from '../enums/http-method.enum';
import { IHttpResponseConstructor } from '../interfaces/http-response-constructor.interface';
import { HTTPResponse } from './http-response.class';
import { HTTPContextData } from './http-context-data.class';

export class HTTPServer {

    private Port: number;
    private server: Server;
    private router: Router;
    private Headers: IHTTPHeader[] = [];
    private Request = {
        before: <IHTTPIntermediateAction[]>[],
        after: <IHTTPIntermediateAction[]>[]
    }

    private ctorResponse: IHttpResponseConstructor;

    constructor(port = 0, responseCtor?: IHttpResponseConstructor) {
        const app = express();
        const router = this.router = Router();
        const server = this.server = http.createServer(app);
        // Parse application/x-www-form-urlencoded
        app.use(bodyParser.urlencoded({ extended: false }));
        // Parse application/json
        app.use(bodyParser.json());
        // Pass router to listen all paths
        app.use(router);
        // Start listening server
        server.listen(port);
        const address = server.address();
        this.Port = port || (address as AddressInfo).port || parseInt(address as string);
        // Save constructor for reply
        this.ctorResponse = responseCtor || HTTPResponse;
    }

    public get port() {
        return this.Port;
    }

    public keys: string[] = [];

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

    private url(paths: (string | undefined)[]) {
        return [ '/', ...paths ].filter(Boolean).join('/').replace(/\/{2,}/g, '/');
    }

    public controllers = {
        add: (controller: IHTTPController, base = '') => {
            const { path, controllers = [ ], handlers } = controller;
            // Register all subcontrollers
            controllers.forEach((controller) => this.controllers.add(controller, this.url([ base, path ])));
            // Register handlers
            handlers.forEach(({ path: { relative, method }, action }) => {
                const absolute = this.url([ base, path, relative ])
                this.handle(absolute, method, action);
            });
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

    public async close() {
        return new Promise((resolve) => {
            this.server.close(resolve);
        });
    }

    private async execute(request: Request, context: IHTTPContextData, action: IHTTPIntermediateAction): Promise<void> {
        const { originalUrl: url } = request;
        const { paths: { include, exclude } = { } } = action;

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
            result = await action.execute(request, context);
        } catch(e) {
            result = <Error>e;
        }

        if((result && result instanceof Error) || context.code >= 400) {
            throw result;
        }
    }

    private async handle(path: string, method: HttpMethodEnum, action: IHTTPControllerHandler<unknown>['action']): Promise<void> {
        this.router[method](path, async (request: Request, response: Response) => {
            try {
                let answer: unknown;

                const data: Partial<IHTTPContextData> = {
                    code: 200,
                    headers: this.headers.get(),
                    keys: this.keys
                }

                const context = new HTTPContextData(request, response, data);

                try {
                    for await(let before of this.Request.before) {
                        await this.execute(request, context, before);
                    }

                    answer = await action(request, context);
                } catch(e) {
                    answer = e;

                    if (context.code >= 200 && context.code < 400) {
                        context.code = 500;
                    }
                } finally {
                    try {
                        for await(let after of this.Request.after) {
                            await this.execute(request, context, after);
                        }
                    } catch(e) { }
                }

                this.reply(response, answer, context);
            } catch(e) { }
        });
    }

    private reply(response: Response, answer: unknown, ctx: IHTTPContextData) {
        try {
            const instance = answer instanceof this.ctorResponse ? answer : new this.ctorResponse(answer, ctx);
            const { code, headers, stream } = instance;

            response.status(code);
    
            [ ...this.headers.get(), ...headers].forEach(({ key, value }) => {
                response.header(key, value);
            });
    
            if (stream) {
                stream.pipe(response);
            } else {
                const reply = instance.reply();

                if (!reply) {
                    response.end();
                    return;
                }

                response.send(reply);
            }
        } catch(e) { }
    }
}