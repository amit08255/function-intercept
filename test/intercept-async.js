"use strict";

const assert = require("assert");
const interceptAsync = require("..").interceptAsync;

describe("interceptAsync(fn: Function): AsyncIntercaptable", () => {
    function sum(a, b) {
        return a + b;
    }

    let _sum = interceptAsync(sum);

    it("should create an interceptable wrapper function as expected", (done) => {
        try {
            assert.strictEqual(typeof _sum, "function");
            assert.strictEqual(_sum.length, 2);
            assert.strictEqual(_sum.name, "sum");
            assert.strictEqual(_sum.toString(), sum.toString());
            assert.strictEqual(typeof _sum.before, "function");
            assert.strictEqual(typeof _sum.after, "function");
        } catch (err) {
            if (err) return done(err);
        }
        
        _sum(1, 2).then(res => {
            assert.strictEqual(res, sum(1, 2));
        }).then(done).catch(done);
    });

    it("should bind before intercepters as expected", (done) => {
        let logs = [];
        _sum.before((a, b) => {
            logs.push([a, b]);
        }).before((a, b) => {
            logs.push(a + b);
        }).after((a, b) => {
            logs.push([a, b]);
        }).after((a, b) => {
            logs.push(a + b);
        });

        _sum(12, 13).then(res => {
            logs.push(res);

            try {
                assert.deepStrictEqual(logs, [[12, 13], 25, 25]);
            } catch (err) {
                if (err) return done(err);
            }

            setTimeout(() => {
                try {
                    assert.deepStrictEqual(logs, [[12, 13], 25, 25, [12, 13], 25]);
                    done();
                } catch (err) {
                    done(err);
                }
            }, 50);
        });
    })
});