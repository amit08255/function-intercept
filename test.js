"use strict";

const intercept = require(".").intercept;
const interceptAsync = require(".").interceptAsync;
const assert = require("assert");

const logs1 = [];
const logs2 = [];

function test(a, b) {
    logs1.push(a + b);
    return a + b;
}

class Test {
    test(a, b) {
        logs2.push(this.constructor.name);
        return a + b;
    }
}

let test1 = intercept(test);
test1.before((a, b) => {
    logs1.push(a, b);
}).after((a, b) => {
    logs1.push(b, a);
});

logs1.push(test1(1, 2));
assert.deepStrictEqual(logs1, [1, 2, 3, 2, 1, 3]);

let test2 = interceptAsync(test);
test2.before(async () => {
    logs1.push("A");
}).before(async () => {
    logs1.push("B");
});
test2(3, 4).then(res => {
    logs1.push(res);
    assert.deepStrictEqual(logs1, [1, 2, 3, 2, 1, 3, "A", "B", 7, 7]);
    console.log("#### Function Test OK ####");
});

Test.prototype.test = intercept(Test.prototype.test);

var t = new Test;
t.test.before((a, b) => {
    logs2.push(a, b);
}).after((a, b) => {
    logs2.push(b, a);
});
logs2.push(t.test(1, 2));
assert.deepStrictEqual(logs2, [1, 2, "Test", 2, 1, 3]);
console.log("#### Class Test OK ####")