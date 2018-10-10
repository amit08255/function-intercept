(function () {
    "use strict";

    var hasSymbol = typeof Symbol == "function";
    var _before = hasSymbol ? Symbol("beforeListeners") : "_beforeListeners";
    var _after = hasSymbol ? Symbol("afterListeners") : "_afterListeners";

    function before(listener) {
        this[_before].push(listener);
        return this;
    }

    function after(listener) {
        this[_after].push(listener);
        return this;
    }

    function set(target, prop, value, writable) {
        Object.defineProperty(target, prop, {
            configurable: true,
            enumerable: false,
            writable: !!writable,
            value: value
        });
    }

    function setup(wrapper) {
        set(wrapper, _before, []);
        set(wrapper, _after, []);
        set(wrapper, "before", before, true);
        set(wrapper, "after", after, true);
    }

    function isArray(obj) {
        return Object.prototype.toString.apply(obj) == "[object Array]";
    }

    function proxy(target, handler, async) {
        if (typeof target != "function") {
            throw new TypeError("the target to intercept must be a function");
        } else if (target.constructor.name == "GeneratorFunction") {
            throw new TypeError("the target to intercept must not be a generator function");
        } else if (target.toString().slice(0, 6) == "class ") {
            throw new TypeError("the target to intercept must not be an ES6 class");
        }

        function wrapper() {
            return handler.apply(wrapper, [
                wrapper.target,
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
            var str = this.target.toString(),
                isAsync = str.slice(0, 6) == "async ";

            return (isAsync || !async) ? str : "async " + str;

        }, true);

        return wrapper;
    }

    function decorate(handler, async) {
        var decorator = function (proto, prop, desc) {
            var wrapper = desc && desc.value.intercepted
                ? desc.value
                : proxy(proto[prop], handler, async);

            set(wrapper, _before, wrapper[_before].concat(decorator[_before]));
            set(wrapper, _after, wrapper[_after].concat(decorator[_after]));
            desc ? desc.value = wrapper : proto[prop] = wrapper;
        };

        setup(decorator);

        return decorator;
    }

    function intercept(target) {
        var handler = function (target, thisArg, args) {
            var returns;
            for (var i = 0; i < this[_before].length; ++i) {
                returns = this[_before][i].apply(thisArg, args);
                if (false === returns)
                    return;
                else if (isArray(returns))
                    args = returns;
            }

            var res = target.apply(thisArg, args);

            for (var j = 0; j < this[_after].length; ++j) {
                returns = this[_after][j].apply(thisArg, args);
                if (false === returns)
                    break;
                else if (isArray(returns))
                    args = returns;
            }

            return res;
        };

        return target ? proxy(target, handler) : decorate(handler);
    }

    function interceptAsync(target) {
        var handler = function (target, thisArg, args) {
            var _this = this,
                invoke = function (listeners, index) {
                    index = index || 0;
                    if (index >= listeners.length) return Promise.resolve(void 0);

                    var listener = listeners[index];

                    return new Promise(function (resolve, reject) {
                        try {
                            var returns = listener.apply(thisArg, args);
                            resolve(returns);
                        } catch (err) {
                            reject(err);
                        }
                    }).then(function (returns) {
                        if (returns === false)
                            return false;
                        else if (isArray(returns))
                            args = returns;

                        return invoke(listeners, index + 1);
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

        return target ? proxy(target, handler, true) : decorate(handler, true);
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