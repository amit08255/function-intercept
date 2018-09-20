"use strict";

const intercept = require(".").intercept;
const before = require(".").before;
const after = require(".").after;
const assert = require("assert");
const __decorate = require("tslib").__decorate;

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

    test2(a, b) {
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
console.log("#### Class Test OK ####");

if (parseFloat(process.version.slice(1)) >= 7.6) {
    require("./test-async");
}

Test.prototype.test = intercept(Test.prototype.test);

__decorate([
    before((a, b) => {
        logs2.push(a, b);
    }),
    before((a, b) => {
        logs2.push("A", "B");
    }),
    after((a, b) => {
        logs2.push(a - b);
    })
], Test.prototype, "test2");

var t = new Test;
t.test.before((a, b) => {
    logs2.push(a, b);
}).after((a, b) => {
    logs2.push(b, a);
});
logs2.push(t.test(1, 2));
assert.deepStrictEqual(logs2, [1, 2, "Test", 2, 1, 3]);
console.log("#### Class Test OK ####");

logs2.push(t.test2(12, 13));
assert.deepStrictEqual(logs2, [1, 2, "Test", 2, 1, 3, "A", "B", 12, 13, "Test", -1, 25]);
console.log("#### Decorator Test OK ####");