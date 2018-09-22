(function () {
    "use strict";

    var hasSymbol = typeof Symbol == "function";
    var _before = hasSymbol ? Symbol("beforeListeners") : "_beforeListeners";
    var _after = hasSymbol ? Symbol("afterListeners") : "_afterListeners";

    function setup(wrapper) {
        wrapper[_before] = [];
        wrapper[_after] = [];
        wrapper.before = function (listener) {
            this[_before].push(listener);
            return this;
        };
        wrapper.after = function (listener) {
            this[_after].push(listener);
            return this;
        };
    }

    function proxy(fn, handler) {
        if (typeof handler != "function") {
            throw new TypeError("the target to intercept must be a function");
        }

        function wrapper() {
            return handler.apply(wrapper, [
                fn,
                this,
                Array.prototype.slice.apply(arguments)
            ]);
        }

        setup(wrapper);

        Object.defineProperties(wrapper, {
            intercepted: {
                configurable: true,
                enumerable: false,
                value: true,
                writable: false,
            },
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
        var decorator = function (proto, prop, desc) {
            var wrapper = desc && desc.value.intercepted
                ? desc.value
                : proxy(proto[prop], handler);

            wrapper[_before] = wrapper[_before].concat(decorator[_before]);
            wrapper[_after] = wrapper[_after].concat(decorator[_after]);
            desc ? desc.value = wrapper : proto[prop] = wrapper;
        };

        setup(decorator);

        return decorator;
    }

    function intercept(fn) {
        var handler = function (target, thisArg, args) {
            for (var i = 0; i < this[_before].length; ++i) {
                if (false === this[_before][i].apply(thisArg, args)) return;
            }

            var res = target.apply(thisArg, args);

            for (var j = 0; j < this[_after].length; ++j) {
                if (false === this[_after][j].apply(thisArg, args)) break;
            }

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

                    return new Promise(function (resolve, reject) {
                        try {
                            var res = listener.apply(thisArg, args);
                            resolve(res);
                        } catch (err) {
                            reject(err);
                        }
                    }).then(function (res) {
                        return res === false ? res : invoke(listeners, index + 1);
                    });
                },
                shouldContinue = true;

            return invoke(_this[_before]).then(function (res) {
                if (res === false) {
                    shouldContinue = false;
                } else {
                    return target.apply(thisArg, args);
                }
            }).then(function (res) {
                if (!shouldContinue) {
                    return res;
                } else {
                    return invoke(_this[_after]).then(() => res);
                }
            }).catch(err => {
                throw err;
            });
        };

        return fn ? proxy(fn, handler) : decorate(handler);
    }

    if (typeof exports == "object") {
        exports.intercept = exports.default = intercept;
        exports.interceptAsync = interceptAsync;
    } else if (typeof define == "function" && define.amd) {
        define(["require", "exports"], function (require, exports) {
            exports.intercept = exports.default = intercept;
            exports.interceptAsync = interceptAsync;
        });
    } else if (typeof window == "object") {
        window.intercept = intercept;
        window.interceptAsync = interceptAsync;
    }
})();