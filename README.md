# Function-Intercepter

**Binding and calling actions before and/or after invoking a function.**

This module honors the principle of AOP (Aspect Oriented Programing) by adding 
`before` and `after` intercepter functions to an existing function on the 
language level, so no need of any framework to implement. More importantly, it's 
very handy and elegant.

## Install

```sh
npm i function-intercepter
```

## Example

### Basic Usage

```javascript
const { intercept } = require("function-intercepter");

function echo(str) {
    console.log(str);
}

let _echo = intercept(echo);
let logs = [];

_echo.before((str) => {
    // the arguments passed to a intercepter function is the same as the ones 
    // passed to the main function. You set any number of intercepters you want,
    // and they will be called sequentially.
    logs.push(str);
}).after((str) => {
    console.log("Log has been output and saved");
});

_echo("This is a log");
// will output:
// This is a log
// Log has been output and saved

console.log(logs); // => ['This is a log']
```

### Async Intercepter

```javascript
const { interceptAsync } = require("function-intercepter");

function echo(str) {
    console.log(str);
}

let _echo = interceptAsync(echo);
let logs = [];

_echo.before(async (str) => {
    logs.push(str);
}).after(async (str) => {
    console.log("Log has been output and saved");
});

_echo("This is a log").then(() => {
    // will output:
    // This is a log
    // Log has been output and saved

    console.log(logs); // => ['This is a log']
});
```

### Decorator Intercepter

```typescript
import { intercept, interceptAsync } from "function-intercepter";

export class Test {
    @intercept().before((str: string) => {
        // ...
    }).before(function (str: string) {
        // since this isn't an arrow function, you can use the variable `this` 
        // as well, it will reference to the instance too.
    }).after((str: string) => {
        // ...
    }).after(function (str: string) {
        // ...
    })
    echo(str: string) {
        // ...
    }

    @interceptAync().before(async (...args) => {
        // ...
    }).before(async function (...args) {
        // since this isn't an arrow function, you can use the variable `this` 
        // as well, it will reference to the instance too.
    }).after(async (...args) => {
        // ...
    }).after(async function (...args) {
        // ...
    })
    async display(...args) {
        // ...
    }

    // for convenience, you can call the decorator multiple times to bind 
    // intercepters, but BE AWARE that the invoking sequence of decorators are 
    // upside down.
    @intercept().before(() => {
        // this function will be called next
    })
    @intercept().before(() => {
        // this function will be called first
    })
    echo(...args) {
        // ...
    }
}
```

### Stop Procedure

Once any intercepter function returns `false`, the procedure will stop invoking 
immediately, if a `before` intercepter returns `false`, not only all the 
following intercepters will stop invoking, but the main function will also 
return (`void`) immediately without invoking. Apart from that, you can whenever 
you want throw an error to stop the procedure.

```javascript
const { intercept } = require("function-intercepter");

function echo(str) {
    console.log(str);
}

let _echo = intercept(echo);
let logs = [];

_echo.before((str) => {
    logs.push(str);
    return false; // return `false` to stop the procedure.
}).before((str) => {
    // this function will never be called
    console.log("Log has been saved");
});

// `_echo()` will return immediately without invoking.
_echo("This is a log");
// will output nothing

console.log(logs); // => ['This is a log']
```

## Signature Of A Intercepter

All the intercepters can accept the same parameters as the original function, 
but they're optional.

In a intercepter function, you can either return a value or not, if you do 
return, only these types of value are concerned:

- `false` Break the calling chain and stop the procedure.
- `Array` The elements in the returning array will be passed as arguments to the
    next intercepter and the main function.

## Notice

The difference between `intercept` and `interceptAsync` is that `interceptAsync`
will always return a `Promise`d wrapper, regardless of the definition of the 
original function, and all the intercepters along with the main function will be
handled in a promise chain.