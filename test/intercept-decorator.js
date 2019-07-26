"use strict";

const assert = require("assert");
const __decorate = require("tslib").__decorate;
const intercept = require("..").intercept;
const interceptAsync = require("..").interceptAsync;

describe("@intercept(): InterceptableDecorator and @interceptAsync(): InterceptableDecorator", () => {
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
            this.a += 1;
            this.b += 1;
        }).before(function () {
            this.a *= this.a;
            this.b *= this.b;
        }).after(function (result) {
            return result + 1;
        }).after(function (result) {
            return result * 2;
        })
    ], Calculator.prototype, "sum", null);

    __decorate([
        interceptAsync().before(function () {
            this.a += 1;
            this.b += 1;
        }).before(function () {
            return new Promise(resolve => {
                this.a *= this.a;
                this.b *= this.b;
                resolve();
            });
        }).after(function (result) {
            return result + 1;
        }).after(function (result) {
            return new Promise(resolve => {
                resolve(result * 2);
            });
        })
    ], Calculator.prototype, "diff", null);

    it("should bind before and after intercepters as expected", () => {
        var cal = new Calculator(1, 2);

        assert.strictEqual(cal.sum(), 28);
    });

    it("should bind async before and async after intercepters as expected", (done) => {
        var cal = new Calculator(2, 1);

        cal.diff().then(res => {
            assert.strictEqual(res, 12);
        }).then(done).catch(done);
    });
});