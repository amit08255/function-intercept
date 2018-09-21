# Function-Intercepter

**Binding and calling actions before and/or after invoking a function.**

This module honors the principle of AOP (Aspect Oriented Programing) by adding 
`before` and `after` intercepter functions to an existing function on the 
language level, so no need of any framework to implement. More important, it 
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
    console.log("Log has been uotput and saved");
});

_echo("This is a log");
// will output:
// This is a log
// Log has been uotput and saved

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

_echo.before((str) => {
    logs.push(str);
}).after((str) => {
    console.log("Log has been uotput and saved");
});

_echo("This is a log").then(() => {
    // will output:
    // This is a log
    // Log has been uotput and saved

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
        // as well, it will reference to the instance as well.
    }).after((str: string) => {
        // ...
    }).after(function (str: string) {
        // ...
    })
    echo (str: string) {
        // ...
    }

    @interceptAync().before(async (str: string) => {
        // ...
    }).before(async function (str: string) {
        // since this isn't an arrow function, you can use the variable `this` 
        // as well, it will reference to the instance as well.
    }).after(async (str: string) => {
        // ...
    }).after(async function (str: string) {
        // ...
    })
    async display(...args) {
        // ...
    }
}
```

### Stop Procedure

Once any intercepter function returns `false`, the procedure will stop invoking 
immediately, if a `before` intercepter returns `false`, not only all the 
following intercepters will stop invoking, but the main function will also 
return (`void`) immediately without invoking. Apart from this, you can whenever 
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
    // the function will never called
    console.log("Log has been saved");
});

// `_echo()` will return immediately without invoking.
_echo("This is a log");
// will output nothing

console.log(logs); // => ['This is a log']
```