# Function-Intercepter

**Binding and calling actions before and/or after invoking a function.**

## Install

```sh
npm i function-intercepter
```

## Example

### Basic

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