
import { Request } from "express";
import { HttpMethodEnum } from '../enums/http-method.enum';
import { IHTTPContextData } from '../interfaces/http-context-data.interface';
import { IHTTPController } from '../interfaces/http-controller.interface';
import { HTTPServer } from './http-server.class';
describe('HTTPServer class', () => {
    describe('HTTPServer instance', () => {
        let httpServer: HTTPServer | undefined;

        afterEach(async () => {
            if (!httpServer) {
                return;
            }

            await httpServer.close();
        });
        it('should instance', () => {
            httpServer = new HTTPServer();
            
            expect(httpServer).toBeInstanceOf(HTTPServer);
        });

        it('should set a port', () => {
            httpServer = new HTTPServer();

            expect(httpServer.port).toEqual(expect.any(Number));
        });

        it('should response', async () => {
            httpServer = new HTTPServer();
            const { port } = httpServer;
            const response = await fetch(`http://localhost:${port}`);

            expect(response).toBeInstanceOf(Response);
        });
    });

    describe('HTTPServer headers', () => {

        let httpServer: HTTPServer;
        let url: string;

        beforeAll(() => {
            httpServer = new HTTPServer();
            const { port } = httpServer;
            url = `http://localhost:${port}`;
            const controller = ((): IHTTPController => {
                return {
                    path: '',
                    handlers: [{
                        path: {
                            method: HttpMethodEnum.GET,
                        },
                        action: async (request: Request, context: IHTTPContextData) => {
                            return 'TEST';
                        }
                    }]
                };
            })();
    
            httpServer.controllers.add(controller);
        });
        

        it('should add a header and return on response', async () => {
            httpServer.headers.add({ key: 'test', value: 'value' });

            const response = await fetch(url);
            const header = response.headers.get('test');

            expect(header).toBe('value');
        });

        it('should add and remove a header and doesnt return on response', async () => {
            httpServer.headers.add({ key: 'test', value: 'value' });
            httpServer.headers.remove('test');

            const response = await fetch(url);
            const header = response.headers.get('test');

            expect(header).toBe(null);
        });

        afterAll(async () => {
            await httpServer.close();
        });
    });

    describe('HTTPServer headers', () => {

        let httpServer: HTTPServer;
        let url: string;

        beforeEach(() => {
            httpServer = new HTTPServer();
            const { port } = httpServer;
            url = `http://localhost:${port}`;
        });
        it('should add a controller', async () => {
            const controller = {
                path: 'test',
                handlers: [{
                    path: {
                        method: HttpMethodEnum.GET,
                    },
                    action: async (request: Request, context: IHTTPContextData) => {
                        return 'TEST';
                    }
                }]
            };
    
            httpServer.controllers.add(controller);
            const response = await fetch(`${url}/test`);
            const text = await response.text();

            expect(text).toBe('TEST');
        });

        it('should add a controller with subcontroller', async () => {
            const subController: IHTTPController = {
                path: 'sub',
                handlers: [{
                    path: {
                        method: HttpMethodEnum.GET,
                    },
                    action: async (request: Request, context: IHTTPContextData) => {
                        return 'SUB';
                    }
                }]
            };

            const controller: IHTTPController = {
                path: 'test',
                handlers: [{
                    path: {
                        method: HttpMethodEnum.GET,
                    },
                    action: async (request: Request, context: IHTTPContextData) => {
                        return 'TEST';
                    }
                }],
                controllers: [ subController ]
            };

            httpServer.controllers.add(controller);
            const responseA = await fetch(`${url}/test`);
            const textA = await responseA.text();

            const responseB = await fetch(`${url}/test/sub`);
            const textB = await responseB.text();

            expect(textA).toBe('TEST');
            expect(textB).toBe('SUB');
        });

        afterEach(async () => {
            await httpServer.close();
        });
    });
});