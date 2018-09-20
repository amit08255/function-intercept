"use strict";

const interceptAsync = require(".").interceptAsync;
const assert = require("assert");

const logs1 = [];

function test(a, b) {
    logs1.push(a + b);
    return a + b;
}

let test2 = interceptAsync(test);
test2.before(async () => {
    logs1.push("A");
}).before(async () => {
    logs1.push("B");
}).after(async () => {
    logs1.push("C");
});
test2(3, 4).then(res => {
    logs1.push(res);
    assert.deepStrictEqual(logs1, ["A", "B", 7, "C", 7]);
    console.log("#### Async Function Test OK ####");
});