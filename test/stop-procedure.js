"use strict";

const assert = require("assert");
const intercept = require("..").intercept;
const interceptAsync = require("..").interceptAsync;

describe("Handle error when any presents", () => {
    it("should stop running the procedure when an intercepter returns BREAK", () => {
        function sum(a, b) {
            return a + b;
        }

        let _sum = intercept(sum);
        let logs = [];

        _sum.before(() => {
            return intercept.BREAK;
        }).before(() => {
            logs.push("A");
        }).after(() => {
            logs.push("B");
        });

        logs.push(_sum(12, 13));
        assert.deepStrictEqual(logs, [void 0]);
    });

    it("should stop running the async procedure when an intercepter returns BREAK", (done) => {
        function sum(a, b) {
            return a + b;
        }

        let _sum = interceptAsync(sum);
        let logs = [];

        _sum.before(() => {
            return intercept.BREAK;
        }).before(() => {
            logs.push("A");
        }).after(() => {
            logs.push("B");
        });

        _sum(12, 13).then((res) => {
            logs.push(res);
            assert.deepStrictEqual(logs, [void 0]);
        }).then(done).catch(done);
    });
});