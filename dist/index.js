"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const pre = Symbol("preHanlders");
const post = Symbol("postHandlers");
function before(handler) {
    this[pre].push(handler);
    return this;
}
function after(handler) {
    this[post].push(handler);
    return this;
}
function set(target, prop, value, writable = false) {
    Object.defineProperty(target, prop, {
        configurable: true,
        enumerable: false,
        writable: !!writable,
        value: value
    });
}
function setup(wrapper) {
    set(wrapper, pre, []);
    set(wrapper, post, []);
    set(wrapper, "before", before, true);
    set(wrapper, "after", after, true);
    return wrapper;
}
function proxy(target, handler, async = false) {
    if (typeof target != "function") {
        throw new TypeError("the target to intercept must be a function");
    }
    else if (target.constructor.name == "GeneratorCallable") {
        throw new TypeError("the target to intercept must not be a generator function");
    }
    else if (target.toString().slice(0, 6) == "class ") {
        throw new TypeError("the target to intercept must not be a class");
    }
    else if (target.intercepted) {
        return target;
    }
    function wrapper() {
        return handler.apply(wrapper, [
            wrapper["target"],
            this,
            Array.prototype.slice.apply(arguments)
        ]);
    }
    setup(wrapper);
    set(wrapper, "intercepted", true);
    set(wrapper, "target", target);
    set(wrapper, "name", target.name);
    set(wrapper, "length", target.length);
    set(wrapper, "toString", function toString() {
        let str = this.target.toString(), isAsync = str.slice(0, 6) == "async ";
        return (isAsync || !async) ? str : "async " + str;
    }, true);
    return wrapper;
}
function decorate(handler, async = false) {
    function decorator(proto, prop, desc) {
        let wrapper = desc.value.intercepted
            ? desc.value
            : proxy(desc.value, handler, async);
        set(wrapper, pre, wrapper[pre].concat(decorator[pre]));
        set(wrapper, post, wrapper[post].concat(decorator[post]));
        desc.value = proto[prop] = wrapper;
    }
    ;
    return setup(decorator);
}
function intercept(target) {
    function handler(target, thisArg, args) {
        for (let handler of this[pre]) {
            let returns = handler.apply(thisArg, args);
            if (intercept.BREAK === returns)
                return;
            else if (Array.isArray(returns))
                args = returns;
        }
        let res = target.apply(thisArg, args);
        for (let handler of this[post]) {
            let returns = handler.call(thisArg, res);
            if (intercept.BREAK === returns)
                break;
            else if (returns !== void 0)
                res = returns;
        }
        return res;
    }
    ;
    return target ? proxy(target, handler) : decorate(handler);
}
exports.intercept = intercept;
function interceptAsync(target) {
    function handler(target, thisArg, args) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            for (let handler of this[pre]) {
                let returns = yield handler.apply(thisArg, args);
                if (intercept.BREAK === returns)
                    return;
                else if (Array.isArray(returns))
                    args = returns;
            }
            let res = yield target.apply(thisArg, args);
            for (let handler of this[post]) {
                let returns = yield handler.call(thisArg, res);
                if (intercept.BREAK === returns)
                    break;
                else if (returns !== void 0)
                    res = returns;
            }
            return res;
        });
    }
    ;
    return target ? proxy(target, handler, true) : decorate(handler, true);
}
exports.interceptAsync = interceptAsync;
(function (intercept) {
    intercept.BREAK = Symbol("intercept.BREAK");
})(intercept = exports.intercept || (exports.intercept = {}));
exports.default = intercept;
//# sourceMappingURL=index.js.map