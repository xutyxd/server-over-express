
export interface IHTTPContextData {
    code: number,
    headers: {
        [key:string]: string
    },
    [any: string]: any
}