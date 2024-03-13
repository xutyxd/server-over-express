
import { Request, Response } from "express";
import { HTTPContextData } from './http-context-data.class';
import { HTTPResponse } from './http-response.class';

describe('HTTPResponse class', () => {
    describe('HTTPResponse instance', () => {
        it('should instance', () => {
            const httpResponse = new HTTPResponse({ }, new HTTPContextData({ } as Request, { } as Response));

            expect(httpResponse).toBeInstanceOf(HTTPResponse);
        });

        it('should set data with message of an error', async () => {
            const error = new Error('Test');
            const httpResponse = new HTTPResponse(error, new HTTPContextData({ } as Request, { } as Response));

            expect(httpResponse.reply().data).toBe('Test');
        });
    });

    describe('HTTPResponse reply', () => {
        it('should reply with a default response', () => {
            const httpResponse = new HTTPResponse(undefined, new HTTPContextData({ } as Request, { } as Response));
            const answer = httpResponse.reply();

            expect(answer).toStrictEqual({ code: 200, data: undefined, timestamp: expect.any(Number) })
        });

        it('should include data to reply', () => {
            const httpResponse = new HTTPResponse({ test: 'response' }, new HTTPContextData({ } as Request, { } as Response));
            const answer = httpResponse.reply();

            expect(answer).toStrictEqual({ code: 200, data: { test: 'response' }, timestamp: expect.any(Number) })
        });
    });
});