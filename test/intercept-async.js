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

    it("should bind async before and async after intercepters as expected", (done) => {
        let logs = [];
        _sum.before((a, b) => {
            logs.push([a, b]);
            return [a + 1, b + 2];
        }).before((a, b) => {
            return new Promise((resolve) => {
                logs.push(a + b);
                resolve(void 0);
            });
        }).after((a, b) => {
            logs.push([a, b]);
            return [a + 1, b + 2];
        }).after((a, b) => {
            return new Promise((resolve) => {
                logs.push(a + b);
                resolve(void 0);
            });
        });

        _sum(12, 13).then(res => {
            logs.push(res);

            assert.deepStrictEqual(logs, [[12, 13], 28, [13, 15], 31, 28]);
        }).then(done).catch(done);
    })
});