
import { HTTPResponse } from './http-response.class';
describe('HTTPResponse class', () => {
    describe('HTTPResponse instance', () => {
        it('should instance', () => {
            const httpResponse = new HTTPResponse({ }, { code: 200, headers: [] });

            expect(httpResponse).toBeInstanceOf(HTTPResponse);
        });

        it('should set data with message of an error', async () => {
            const error = new Error('Test');
            const httpResponse = new HTTPResponse(error, { code: 200, headers: [] });

            expect(httpResponse.reply().data).toBe('Test');
        });
    });

    describe('HTTPResponse reply', () => {
        it('should reply with a default response', () => {
            const httpResponse = new HTTPResponse(undefined, { code: 200, headers: [] });
            const answer = httpResponse.reply();

            expect(answer).toStrictEqual({ code: 200, data: undefined, timestamp: expect.any(Number) })
        });

        it('should include data to reply', () => {
            const httpResponse = new HTTPResponse({ test: 'response' }, { code: 200, headers: [] });
            const answer = httpResponse.reply();

            expect(answer).toStrictEqual({ code: 200, data: { test: 'response' }, timestamp: expect.any(Number) })
        });
    });
});