"use strict";

const assert = require("assert");
const intercept = require("..").intercept;

describe("intercept(fn: Function): Interceptable", () => {
    /**
     * @param {number} a 
     * @param {number} b 
     */
    function sum(a, b) {
        return a + b;
    }

    let _sum = intercept(sum);

    it("should create an interceptable wrapper function as expected", () => {
        assert.strictEqual(typeof _sum, "function");
        assert.strictEqual(_sum.length, 2);
        assert.strictEqual(_sum.name, "sum");
        assert.strictEqual(_sum.toString(), sum.toString());
        assert.strictEqual(typeof _sum.before, "function");
        assert.strictEqual(typeof _sum.after, "function");
        assert.strictEqual(_sum.target, sum);
        assert.strictEqual(_sum(1, 2), sum(1, 2));
    });

    it("should bind before and after intercepters as expected", () => {
        let logs = [];
        _sum.before((a, b) => {
            logs.push([a, b]);
            return [a + 1, b + 2];
        }).before((a, b) => {
            logs.push(a + b);
        }).after((a, b) => {
            logs.push([a, b]);
            return [a + 1, b + 2];
        }).after((a, b) => {
            logs.push(a + b);
        });

        logs.push(_sum(12, 13));

        assert.deepStrictEqual(logs, [[12, 13], 28, [13, 15], 31, 28]);
    });

    it("should not create interceptable wrapper again if alreay intercepted", () => {
        let sum2 = intercept(_sum);
        assert.strictEqual(sum2, _sum);
    });
});