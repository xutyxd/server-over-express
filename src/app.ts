
import { Request } from "express";
import { HTTPServer } from "./classes";
import { HttpMethodEnum } from "./enums";
import { IHTTPController } from "./interfaces";
import { IHTTPContextData } from "./interfaces/http-context-data.interface";


const app = new HTTPServer(8083);

app.headers.add({ key: 'test', value: 'value' });

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

// app.controllers.add(controller);