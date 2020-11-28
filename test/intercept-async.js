/* global describe, it */
"use strict";

const assert = require("assert");
const interceptAsync = require("..").interceptAsync;

describe("interceptAsync(fn: Function): Interceptable", () => {
    /**
     * @param {number} a 
     * @param {number} b 
     */
    function sum(a, b) {
        return a + b;
    }

    function isAsync(fn) {
        return fn.toString().slice(0, 6) == "async ";
    }

    let _sum = interceptAsync(sum);

    it("should create an async interceptable wrapper function as expected", (done) => {
        try {
            assert.strictEqual(typeof _sum, "function");
            assert.strictEqual(_sum.length, 2);
            assert.strictEqual(_sum.name, "sum");
            assert.strictEqual(_sum.toString(), (isAsync(sum) ? "" : "async ") + sum.toString());
            assert.strictEqual(typeof _sum.before, "function");
            assert.strictEqual(typeof _sum.after, "function");
            assert.strictEqual(_sum.target, sum);
        } catch (err) {
            if (err) return done(err);
        }

        _sum(1, 2).then(res => {
            assert.strictEqual(res, sum(1, 2));
        }).then(done).catch(done);
    });

    it("should bind async before and async after interceptors as expected", (done) => {
        _sum.before((a, b) => { // 1, 2
            return [a + 1, b + 1]; // 2, 3
        }).before((a, b) => {
            return new Promise((resolve) => {
                resolve([a * a, b * b]); // 4, 9
            });
        }).after((result) => { // 13
            return result + 1; // 14
        }).after((result) => {
            return new Promise((resolve) => {
                resolve(result * 2); // 28
            });
        });

        _sum(1, 2).then(res => {
            assert.strictEqual(res, 28);
        }).then(done).catch(done);
    });

    it("should not create interceptable wrapper again if alreay intercepted", () => {
        let sum2 = interceptAsync(_sum);
        assert.strictEqual(sum2, _sum);
    });
});
