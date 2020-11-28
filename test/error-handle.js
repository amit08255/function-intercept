/* global describe, it */
"use strict";

const assert = require("assert");
const intercept = require("..").intercept;
const interceptAsync = require("..").interceptAsync;

describe("Handle error when any presents", () => {
    it("should stop running the procedure when an error is thrown", (done) => {
        function sum(a, b) {
            return a + b;
        }

        let _sum = intercept(sum);
        let logs = [];

        _sum.before(() => {
            throw new Error("should stop procedure");
        }).before(() => {
            logs.push("A");
        }).after(() => {
            logs.push("B");
        });

        try {
            logs.push(_sum(12, 13));
        } catch (err) {
            if (err.message == "should stop procedure") {
                assert.deepStrictEqual(logs, []);
                done();
            } else {
                done(err);
            }
        }
    });

    it("should stop running the async procedure when an error is thrown", (done) => {
        function sum(a, b) {
            return a + b;
        }

        let _sum = interceptAsync(sum);
        let logs = [];

        _sum.before(() => {
            throw new Error("should stop procedure");
        }).before(() => {
            logs.push("A");
        }).after(() => {
            logs.push("B");
        });

        _sum(12, 13).then((res) => {
            logs.push(res);
        }).catch(err => {
            if (err.message == "should stop procedure") {
                assert.deepStrictEqual(logs, []);
                done();
            } else {
                done(err);
            }
        });
    });
});
