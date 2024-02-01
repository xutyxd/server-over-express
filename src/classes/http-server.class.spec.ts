
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
        const httpServer = new HTTPServer();
        const { port } = httpServer;
        const url = `http://localhost:${port}`;
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

        it('should add a header and return on response', async () => {
            httpServer.headers.add({ key: 'test', value: 'value' });

            const response = await fetch(url);
            const header = response.headers.get('test');

            expect(header).toBe('value');
        });

        afterAll(async () => {
            await httpServer.close();
        });
    });
});