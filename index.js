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

function decorate(handler) {
    var decorator = function (proto, prop) {
        var wrapper = proxy(proto[prop], handler);

        for (var i = 0; i < decorator[beforeListeners].length; i++) {
            wrapper.before(decorator[beforeListeners][i]);
        }

        for (var j = 0; j < decorator[afterListeners].length; j++) {
            wrapper.after(decorator[afterListeners][j]);
        }

        proto[prop] = wrapper;
    };

    decorator[beforeListeners] = [];
    decorator[afterListeners] = [];
    decorator.before = function (listener) {
        this[beforeListeners].push(listener);
        return this;
    };
    decorator.after = function (listener) {
        this[afterListeners].push(listener);
        return this;
    };

    return decorator;
}

function runAsync(callback) {
    if (typeof setImmediate == "function") {
        setImmediate(() => callback());
    } else if (typeof Promise == "function") {
        Promise.resolve(null).then(() => callback()).catch(err => {
            throw err;
        });
    } else {
        setTimeout(() => callback(), 0);
    }
}

function intercept(fn) {
    var handler = function (target, thisArg, args) {
        for (var i = 0; i < this[beforeListeners].length; i++) {
            this[beforeListeners][i].apply(thisArg, args);
        }

        var res = target.apply(thisArg, args);

        runAsync(() => {
            for (var j = 0; j < this[afterListeners].length; j++) {
                this[afterListeners][j].apply(thisArg, args);
            }
        });

        return res;
    };

    return fn ? proxy(fn, handler) : decorate(handler);
}

function interceptAsync(fn) {
    var handler = function (target, thisArg, args) {
        var _this = this,
            invoke = function (listeners, index) {
                index = index || 0;
                if (index >= listeners.length) return Promise.resolve(void 0);

                let listener = listeners[index];

                return Promise.resolve(listener.apply(thisArg, args))
                    .then(function () {
                        return invoke(listeners, index + 1);
                    });
            };

        return invoke(_this[beforeListeners]).then(function () {
            return target.apply(thisArg, args);
        }).then(function (res) {
            runAsync(() => invoke(_this[afterListeners]));
            return res;
        }).catch(err => {
            throw err;
        });
    };

    return fn ? proxy(fn, handler) : decorate(handler);
}

exports.intercept = exports.default = intercept;
exports.interceptAsync = interceptAsync;