
import { IHTTPControllerHandler } from "./http-controller-handler.interface";

export interface IHTTPController {
    path: string;
    handlers: IHTTPControllerHandler<unknown>[];
    controllers?: IHTTPController[]
}