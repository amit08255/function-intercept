"use strict";

const assert = require("assert");
const __decorate = require("tslib").__decorate;
const intercept = require("..").intercept;
const interceptAsync = require("..").interceptAsync;

describe("@intercept(): InterceptableDecorator and @interceptAsync(): InterceptableDecorator", () => {
    let logs1 = [];
    let logs2 = [];

    class Calculator {
        constructor(a, b) {
            this.a = a;
            this.b = b;
        }

        sum() {
            return this.a + this.b;
        }

        diff() {
            return Promise.resolve(this.a - this.b);
        }
    }

    __decorate([
        intercept().before(function () {
            logs1.push([this.a, this.b]);
        }).before(function () {
            logs1.push(this.a + this.b);
        }).after(function () {
            logs1.push([this.b, this.a]);
        }).after(function () {
            logs1.push(this.b - this.a);
        })
    ], Calculator.prototype, "sum");

    __decorate([
        interceptAsync().before(function () {
            logs2.push([this.a, this.b]);
        }).before(function () {
            return new Promise(resolve => {
                logs2.push(this.a + this.b);
                resolve(void 0);
            });
        }).after(function () {
            logs2.push([this.b, this.a]);
        }).after(function () {
            return new Promise(resolve => {
                logs2.push(this.b - this.a);
                resolve(void 0);
            });
        })
    ], Calculator.prototype, "diff");

    it("should bind before and after intercepters as expected", () => {
        var cal = new Calculator(12, 13);

        logs1.push(cal.sum());

        assert.deepStrictEqual(logs1, [[12, 13], 25, [13, 12], 1, 25]);
    });

    it("should bind async before and async after intercepters as expected", (done) => {
        var cal = new Calculator(12, 13);

        cal.diff(12, 13).then(res => {
            logs2.push(res);

            assert.deepStrictEqual(logs1, [[12, 13], 25, [13, 12], 1, 25]);
        }).then(done).catch(done);
    });
});