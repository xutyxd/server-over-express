
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

            expect(httpResponse.data).toBe('Test');
        });
    });
});