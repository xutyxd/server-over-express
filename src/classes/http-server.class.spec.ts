
import { Request as HTTPRequest } from "express";
import { HttpMethodEnum } from '../enums/http-method.enum';
import { IHTTPContextData } from '../interfaces/http-context-data.interface';
import { IHTTPController } from '../interfaces/http-controller.interface';
import { HTTPServer } from './http-server.class';
import { IHTTPIntermediateAction } from "../interfaces/http-intermediate-action.interface";
import { IHttpResponseConstructor } from "../interfaces/http-response-constructor.interface";
describe('HTTPServer class', () => {
    describe('HTTPServer instance', () => {
        let httpServer: HTTPServer;

        beforeEach(() => {
            httpServer = new HTTPServer();
        });

        afterEach(async () => {
            if (!httpServer) {
                return;
            }

            await httpServer.close();
        });
        it('should instance', () => {
            expect(httpServer).toBeInstanceOf(HTTPServer);
        });

        it('should set a port', () => {
            expect(httpServer.port).toEqual(expect.any(Number));
        });

        it('should set an specific port', async () => {
            const port = 8083;
            const httpServer = new HTTPServer(port);
            const response = await fetch(`http://localhost:${port}`);

            expect(response).toBeInstanceOf(Response);
            await httpServer.close();
        });

        it('should set an specific response', async () => {
            const port = 8083;
            const httpResponse: IHttpResponseConstructor = class {

                public data: unknown;
                public code = 253;
                public headers = [];

                constructor(response: unknown, context: IHTTPContextData) {
                    this.data = 'Response';
                }
            }

            const httpServer = new HTTPServer(port, httpResponse);
            const controller = ((): IHTTPController => {
                return {
                    path: '',
                    handlers: [{
                        path: {
                            method: HttpMethodEnum.GET,
                        },
                        action: async (request: HTTPRequest, context: IHTTPContextData) => {
                            return 'TEST';
                        }
                    }]
                };
            })();
            httpServer.controllers.add(controller);

            const response = await fetch(`http://localhost:${port}`);
            const text = await response.text();
            const status = response.status;

            expect(text).toBe('Response');
            expect(status).toBe(253);
            await httpServer.close();
        });

        it('should response', async () => {
            const { port } = httpServer;
            const response = await fetch(`http://localhost:${port}`);

            expect(response).toBeInstanceOf(Response);
        });
    });

    describe('HTTPServer headers', () => {

        let httpServer: HTTPServer;
        let url: string;

        beforeEach(() => {
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
                        action: async (request: HTTPRequest, context: IHTTPContextData) => {
                            return 'TEST';
                        }
                    }]
                };
            })();
    
            httpServer.controllers.add(controller);
        });

        afterEach(async () => {
            await httpServer.close();
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
    });

    describe('HTTPServer controllers', () => {

        let httpServer: HTTPServer;
        let url: string;

        beforeEach(() => {
            httpServer = new HTTPServer();
            const { port } = httpServer;
            url = `http://localhost:${port}`;
        });

        afterEach(async () => {
            await httpServer.close();
        });

        it('should add a controller', async () => {
            const controller = {
                path: 'test',
                handlers: [{
                    path: {
                        method: HttpMethodEnum.GET,
                    },
                    action: async (request: HTTPRequest, context: IHTTPContextData) => {
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
                    action: async (request: HTTPRequest, context: IHTTPContextData) => {
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
                    action: async (request: HTTPRequest, context: IHTTPContextData) => {
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
    });

    describe('HTTPServer request', () => {
        let httpServer: HTTPServer;
        let url: string;

        beforeEach(() => {
            httpServer = new HTTPServer();
            const { port } = httpServer;
            url = `http://localhost:${port}`;
        });

        afterEach(async () => {
            await httpServer.close();
        });

        describe('HTTPServer request.before', () => {
            it('should add a before.action to perform before request', async () => {
                const action: IHTTPIntermediateAction = {
                    execute: (request: HTTPRequest, context: IHTTPContextData) => {
                        context.headers.push({ key: 'key', value: 'value' });
                        context.test = 'TEST';
                    },
                    paths: {
                        include: ['']
                    }
                }

                const controller = {
                    path: '',
                    handlers: [{
                        path: {
                            method: HttpMethodEnum.GET,
                        },
                        action: async (request: HTTPRequest, context: IHTTPContextData) => {
                            return context.test;
                        }
                    }]
                };

                httpServer.controllers.add(controller);
                httpServer.request.before.add(action);

                const response = await fetch(url);
                const text = await response.text();
                const header = response.headers.get('key');

                expect(header).toBe('value');
                expect(text).toBe('TEST');
            });

            it('should add a before.action and not execute it using exclude path', async () => {
                const action: IHTTPIntermediateAction = {
                    execute: (request: HTTPRequest, context: IHTTPContextData) => {
                        context.headers.push({ key: 'key', value: 'value' });
                        context.test = 'TEST';
                    },
                    paths: {
                        include: [''],
                        exclude: ['']
                    }
                }

                const controller = {
                    path: '',
                    handlers: [{
                        path: {
                            method: HttpMethodEnum.GET,
                        },
                        action: async (request: HTTPRequest, context: IHTTPContextData) => {
                            return context.test;
                        }
                    }]
                };

                httpServer.controllers.add(controller);
                httpServer.request.before.add(action);

                const response = await fetch(url);
                const text = await response.text();
                const header = response.headers.get('key');

                expect(header).toBe(null);
                expect(text).toBe('');
            });

            it('should add a before.action, throw an error an controller.action will not be executed', async () => {
                const action: IHTTPIntermediateAction = {
                    execute: (request: HTTPRequest, context: IHTTPContextData) => {
                        context.headers.push({ key: 'key', value: 'value' });
                        context.test = 'TEST';

                        throw new Error('Action error');
                    },
                    paths: {
                        include: [''],
                    }
                }

                const controller = {
                    path: '',
                    handlers: [{
                        path: {
                            method: HttpMethodEnum.GET,
                        },
                        action: async (request: HTTPRequest, context: IHTTPContextData) => {
                            return context.test;
                        }
                    }]
                };

                httpServer.controllers.add(controller);
                httpServer.request.before.add(action);

                const response = await fetch(url);
                const text = await response.text();
                const header = response.headers.get('key');

                expect(response.status).toBe(500);
                expect(header).toBe('value');
                expect(text).toBe('Action error');
            });

            it('should add and then remove a before.action to perform before request', async () => {
                const action: IHTTPIntermediateAction = {
                    execute: (request: HTTPRequest, context: IHTTPContextData) => {
                        context.headers.push({ key: 'key', value: 'value' });
                    }
                }

                httpServer.request.before.add(action);
                httpServer.request.before.remove(action.execute);

                const response = await fetch(url);
                const header = response.headers.get('test');

                expect(header).toBe(null);
            });
        });

        describe('HTTPServer request.after', () => {
            it('should add an after.action to perform after request', async () => {
                const action: IHTTPIntermediateAction = {
                    execute: (request: HTTPRequest, context: IHTTPContextData) => {
                        context.headers.push({ key: 'key', value: 'value' });
                        context.test = 'TEST';
                    },
                    paths: {
                        include: ['']
                    }
                }

                const controller = {
                    path: '',
                    handlers: [{
                        path: {
                            method: HttpMethodEnum.GET,
                        },
                        action: async (request: HTTPRequest, context: IHTTPContextData) => {
                            return context.test;
                        }
                    }]
                };

                httpServer.controllers.add(controller);
                httpServer.request.after.add(action);

                const response = await fetch(url);
                const text = await response.text();
                const header = response.headers.get('key');

                expect(header).toBe('value');
                expect(text).toBe('');
            });

            it('should add an after.action and not execute it using exclude path', async () => {
                const action: IHTTPIntermediateAction = {
                    execute: (request: HTTPRequest, context: IHTTPContextData) => {
                        context.headers.push({ key: 'key', value: 'value' });
                        context.test = 'TEST';
                    },
                    paths: {
                        include: [''],
                        exclude: ['']
                    }
                }

                const controller = {
                    path: '',
                    handlers: [{
                        path: {
                            method: HttpMethodEnum.GET,
                        },
                        action: async (request: HTTPRequest, context: IHTTPContextData) => {
                            return context.test;
                        }
                    }]
                };

                httpServer.controllers.add(controller);
                httpServer.request.after.add(action);

                const response = await fetch(url);
                const text = await response.text();
                const header = response.headers.get('key');

                expect(header).toBe(null);
                expect(text).toBe('');
            });

            it('should add an after.action, and modify status code', async () => {
                const action: IHTTPIntermediateAction = {
                    execute: (request: HTTPRequest, context: IHTTPContextData) => {
                        context.headers.push({ key: 'key', value: 'value' });
                        context.test = 'TEST';
                        context.code = 500;
                    },
                    paths: {
                        include: [''],
                    }
                }

                const controller = {
                    path: '',
                    handlers: [{
                        path: {
                            method: HttpMethodEnum.GET,
                        },
                        action: async (request: HTTPRequest, context: IHTTPContextData) => {
                            return 'AFTER';
                        }
                    }]
                };

                httpServer.controllers.add(controller);
                httpServer.request.after.add(action);

                const response = await fetch(url);
                const text = await response.text();
                const header = response.headers.get('key');

                expect(response.status).toBe(500);
                expect(header).toBe('value');
                expect(text).toBe('AFTER');
            });

            it('should add and then remove an after.action to perform after request', async () => {
                const action: IHTTPIntermediateAction = {
                    execute: (request: HTTPRequest, context: IHTTPContextData) => {
                        context.headers.push({ key: 'key', value: 'value' });
                    }
                }

                httpServer.request.after.add(action);
                httpServer.request.after.remove(action.execute);

                const response = await fetch(url);
                const header = response.headers.get('test');

                expect(header).toBe(null);
            });
        });
    });
});