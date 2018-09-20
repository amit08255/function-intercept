"use strict";

var hasSymbol = typeof Symbol == "function";
var beforeListeners = hasSymbol ? Symbol("beforeListeners") : "_beforeListeners";
var afterListeners = hasSymbol ? Symbol("afterListeners") : "_afterListeners";

function proxy(fn, handler) {
    if (typeof handler != "function") return fn;

    function wrapper() {
        return handler.apply(wrapper, [
            fn,
            this,
            Array.prototype.slice.apply(arguments)
        ]);
    }

    wrapper[beforeListeners] = [];
    wrapper[afterListeners] = [];
    wrapper.before = function (listener) {
        this[beforeListeners].push(listener);
        return this;
    };
    wrapper.after = function (listener) {
        this[afterListeners].push(listener);
        return this;
    };

    Object.defineProperties(wrapper, {
        name: {
            configurable: true,
            enumerable: false,
            value: fn.name,
            writable: false,
        },
        length: {
            configurable: true,
            enumerable: false,
            value: fn.length,
            writable: false,
        },
        toString: {
            configurable: true,
            enumerable: false,
            value: function toString() {
                return fn.toString();
            },
            writable: true,
        }
    });

    return wrapper;
}

function intercept(fn) {
    return proxy(fn, function (target, thisArg, args) {
        for (var i = 0; i < this[beforeListeners].length; i++) {
            this[beforeListeners][i].apply(thisArg, args);
        }

        var res = target.apply(thisArg, args);

        for (var j = 0; j < this[afterListeners].length; j++) {
            this[afterListeners][j].apply(thisArg, args);
        }

        return res;
    });
}

function interceptAsync(fn) {
    return proxy(fn, function (target, thisArg, args) {
        var _this = this,
            res = void 0,
            invoke = function (listeners, index) {
                index = index || 0;
                if (index >= listeners.length) return;

                let listener = listeners[index];

                return Promise.resolve(listener.apply(thisArg, args))
                    .then(function () {
                        return invoke(listeners, index + 1);
                    });
            };

        return invoke(_this[beforeListeners]).then(function () {
            return target.apply(thisArg, args);
        }).then(function (_res) {
            res = _res;
            return invoke(_this[afterListeners]);
        }).then(function () {
            return res;
        });
    });
}

function before(listener) {
    return function (proto, prop) {
        if (proto[prop][beforeListeners] === undefined) {
            proto[prop] = intercept(proto[prop]);
        }

        proto[prop].before(listener);
    }
}

function beforeAsync(listener) {
    return function (proto, prop) {
        if (proto[prop][beforeListeners] === undefined) {
            proto[prop] = interceptAsync(proto[prop]);
        }

        proto[prop].before(listener);
    }
}

function after(listener) {
    return function (proto, prop) {
        if (proto[prop][afterListeners] === undefined) {
            proto[prop] = intercept(proto[prop]);
        }

        proto[prop].after(listener);
    }
}

function afterAsync(listener) {
    return function (proto, prop) {
        if (proto[prop][beforeListeners] === undefined) {
            proto[prop] = interceptAsync(proto[prop]);
        }

        proto[prop].after(listener);
    }
}

exports.intercept = exports.default = intercept;
exports.interceptAsync = interceptAsync;
exports.before = before;
exports.beforeAsync = beforeAsync;
exports.after = after;
exports.afterAsync = afterAsync;