# Function-Intercepter

**Binding and calling actions before and/or after invoking a function.**

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

_echo.bafore((str) => {
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

_echo.bafore((str) => {
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
import { before, beforeAsync, after, afterAsync } from "function-intercepter";

export class Test {
    @intercept().before((str: string) => {
        // the arguments passed to this function is the same as the one passed 
        // to method.
    }).before(function (str: string) {
        // you can set multiple intercepter functions,
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
        // the arguments passed to this function is the same as the one passed 
        // to method.
    }).before(async function (str: string) {
        // you can set multiple intercepter functions,
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