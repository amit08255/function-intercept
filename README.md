# Function-Intercepter

**Binding and calling actions before and/or after invoking a function.**

This module honors the principle of AOP (Aspect Oriented Programing) by adding 
pre and post-intercepter functions to an existing function on the language level,
to modify the input and output of an function in a handy and elegant way.

## Install

```sh
npm i function-intercepter
```

## Example

### Basic Usage

```javascript
const { intercept } = require("function-intercepter");

function sum(a, b) {
    return a + b;
}

let _sum = intercept(sum);

_sum.before((a, b) => {
    // The arguments passed to a pre-intercepter is the same as the ones passed
    // to the main function.
    // If you return an array, then the elements will be used as arguments
    // passed to the subsequent intercepters and the original function.
    // If you don't return anything, them the arguments will remain untouched.
    return [a * a, b * b];
}).before((a, b) => {
    // You can set any number of intercepters you want, and they will be called
    // sequentially.
    return [a * 2, b * 2];
}).after((result) => {
    // The result value evaluated by the pre-intercepters and the main function
    // will be passed to the post-intercepters.
    // If you return anything other than `undefined`, then the returning value
    // will replace the original result and be passed to subsequent intercepters.
    return result / 2;
});

console.log(_sum(1, 2));
// => 5
// 1. arguments changed to [1, 4] by the first pre-intercepter
// 2. arguments changed to [2, 8] by the second pre-intercepter
// 3. result in 10 by the main function
// 4. result in 5 by the post-intercepter
```

### Async Intercepter

```javascript
const { interceptAsync } = require("function-intercepter");

async function sum(a, b) {
    return a + b;
}

let _sum = interceptAsync(sum);

_sum.before(async (a, b) => {
    // An async intercepter is very much alike to the synchronous version, 
    // except it can handle async operations.
    return [a * a, b * b];
}).before((a, b) => {
    // The intercepter doesn't have be async, it all depends on your needs.
    return [a * 2, b * 2];
}).after((result) => {
    return result / 2;
});

(async () => {
    console.log(await _sum(1, 2));
})();
```

### Decorator Intercepter

```typescript
import { intercept, interceptAsync } from "function-intercepter";

export class Test {
    @intercept().before((str: string) => {
        // ...
    }).before(function (this: Test, str: string) {
        // Since this isn't an arrow function, you can use the variable `this` 
        // as well, it will reference to the instance too.
    }).after((result: any) => {
        // ...
    }).after(function (result: any) {
        // ...
    })
    echo(str: string): any {
        // ...
    }

    @interceptAync().before(async (...args) => {
        // ...
    }).before(async function (...args) {
        // ...
    }).after(async (result: any) => {
        // ...
    }).after(async function (result: any) {
        // ...
    })
    async display(...args): Promise<any> {
        // ...
    }

    // For convenience, you can call the decorator multiple times to bind 
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

**NOTE:**

~~An old version of this package accepts the same parameters in the
post-intercepter as in the pre-intercepter, however, since *1.0.0*, that feature
is changed, now the post-intercepter accepts the result of the function as its
only parameter.~~

### Stop Procedures

Once any intercepter function returns `intercept.BREAK`, the procedures will 
stop invoking immediately, if a pre-intercepter returns `false`, not only
all the following intercepters will stop invoking, but the main function will
also return (`void`) immediately without invoking. Apart from that, you can, 
whenever you want, throw an error to stop the procedure.

**NOTE:**

~~An old version of this package allows to return `false` to break the
procedures, however, since *1.0.0*, that feature is removed, always return
`intercept.BREAK` to break procedures instead.~~

```javascript
const { intercept } = require("function-intercepter");

function echo(str) {
    console.log(str);
}

let _echo = intercept(echo);
let logs = [];

_echo.before((str) => {
    logs.push(str);
    return intercept.BREAK; // return `false` to stop the procedure.
}).before((str) => {
    // this function will never be called
    console.log("Log has been saved");
});

_echo("This is a log");
// will output nothing
// `_echo()` returned immediately without invoking the main function.

console.log(logs); // => ['This is a log']
```

## Signature Of A Intercepter

All pre-intercepters (bound by `before`) can accept the same parameters as the
original function, but they're optional.

A pre-intercepter can either not return anything (return `undefined`), or return
an array which modifies the arguments passed to the next intercepter and the
main function.

All post-intercepters (bound by `after`) can accept only one parameter that is
the result of a previous intercepter or the main function, but they're optional.

A post-intercepter can either not return anything (return `undefined`), or
return anything to modify the result of the function call.

## Notice

The difference between `intercept` and `interceptAsync` is that `interceptAsync`
will always return a `Promise`d wrapper, regardless of the definition of the 
original function, and all the intercepters along with the main function will be
handled in a promise chain.