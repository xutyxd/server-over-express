# Server over Express (SoE) ![NPM Downloads](https://img.shields.io/npm/dw/server-over-express)

## Description
A wrapper over express to order all things like middleware, controllers and context.

## Installation
``` bash
npm i server-over-express
```
#### Import in ES6 (Node/Web)
``` ts

import { HTTPServer } from 'server-over-express';

```

#### Import in CommonJS
``` js

const { HTTPServer } = require('server-over-express');

```

## Examples

Review tests for more examples
### Basic server

```ts
import { HTTPServer } from 'server-over-express';

const httpServer = new HTTPServer();

console.log('Listening on port: ', httpServer.port);
```

### Define a port

```ts
import { HTTPServer } from 'server-over-express';

const httpServer = new HTTPServer(8080);
```

### Define a common response for all request
```ts
import { HTTPServer } from 'server-over-express';

const httpResponse: IHttpResponseConstructor = class {

    public data: unknown; //This is the property used to reply a request
    public code = 253;
    public headers = [];
    public timestamp = new Date().getTime();
                //This the response of a constructor
    constructor(response: unknown, context: IHTTPContextData) {
        this.data ={ ...this, data: response, headers: undefined };
    }
}

const httpServer = new HTTPServer(8080, httpResponse);
```

### Handle request with controllers
```ts
import { HTTPServer, IHTTPController, HttpMethodEnum, IHTTPContextData, HTTPRequest } from 'server-over-express';

const httpServer = new HTTPServer();

const controller = ((): IHTTPController => {
    return {
        path: '/user',
        handlers: [{
            path: {
                method: HttpMethodEnum.GET,
            },
            action: async (request: HTTPRequest, context: IHTTPContextData) => {
                return { user: 'username' };
            }
        }]
    };
})();

httpServer.controllers.add(controller);
```

### Handle request with controllers and subcontrollers
```ts
import { HTTPServer, IHTTPController, HttpMethodEnum, IHTTPContextData, HTTPRequest } from 'server-over-express';

const httpServer = new HTTPServer();
const subController: IHTTPController = {
    path: 'uploads',
    handlers: [{
        path: {
            method: HttpMethodEnum.GET,
        },
        action: async (request: HTTPRequest, context: IHTTPContextData) => {
            return [{ file: 'File-A' }, { file: 'File-B' }, { file: 'File-C' }];
        }
    }]
};
const controller = {
    path: '/user',
    handlers: [{
        path: {
            method: HttpMethodEnum.GET,
        },
        action: async (request: HTTPRequest, context: IHTTPContextData) => {
            return { user: 'username' };
        }
    }],
    controllers: [ subController ]
};

httpServer.controllers.add(controller);

/*
    ''
    \
     'user' -> { user: 'username' }
     \
      \
       'uploads' -> [{ file: 'File-A' }, { file: 'File-B' }, { file: 'File-C' }]
*/
```

### Handling a not found error
```ts
const httpServer = new HTTPServer();
const controller: IHTTPController = {
    path: '*',
    handlers: [{
        path: {
            method: HttpMethodEnum.GET,
        },
        action: async (request: HTTPRequest, context: IHTTPContextData) => {
            return 'Not found!';
        }
    }]
};

httpServer.controller.add(controller);
```

### Execute actions before reply a request (AUTH)
```ts
import { HTTPServer, IHTTPController, HttpMethodEnum, IHTTPContextData, HTTPRequest } from 'server-over-express';

const httpServer = new HTTPServer();

const controller = ((): IHTTPController => {
    return {
        path: '/user',
        handlers: [{
            path: {
                method: HttpMethodEnum.GET,
            },
            action: async (request: HTTPRequest, context: IHTTPContextData) => {
                return { user: 'username' };
            }
        }]
    };
})();
// This action authorized 50% of the times
const action: IHTTPIntermediateAction = {
    execute: (request: HTTPRequest, context: IHTTPContextData) => {
        const result = Math.round(Math.random());

        if (!result) {
            throw new Error('Unauthorized');
        }
    },
    paths: {
        include: [''] // For all routes
    }
}

httpServer.controllers.add(controller);
httpServer.request.before.add(action);
```


### Execute actions after reply a request (CORS)
```ts
import { HTTPServer, IHTTPController, HttpMethodEnum, IHTTPContextData, HTTPRequest } from 'server-over-express';

const httpServer = new HTTPServer();

const controller = ((): IHTTPController => {
    return {
        path: '/user',
        handlers: [{
            path: {
                method: HttpMethodEnum.GET,
            },
            action: async (request: HTTPRequest, context: IHTTPContextData) => {
                return { user: 'username' };
            }
        }]
    };
})();
// This action add a CORS header
const action: IHTTPIntermediateAction = {
    execute: (request: HTTPRequest, context: IHTTPContextData) => {
        context.headers.push({ key: 'Access-Control-Allow-Origin', value: '*' });
        context.test = 'TEST';
    },
    paths: {
        include: [''] // For all routes
    }
}

httpServer.controllers.add(controller);
httpServer.request.after.add(action);
```

### Close server

```ts
import { HTTPServer } from 'server-over-express';

const httpServer = new HTTPServer();

(async () => {
    await httpServer.close();
});
```