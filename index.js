"use strict";

var proxy = require("fn-intercept").sync;
var hasSymbol = typeof Symbol == "function";
var beforeListeners = hasSymbol ? Symbol("beforeListeners") : "_beforeListeners";
var afterListeners = hasSymbol ? Symbol("afterListeners") : "_afterListeners";

function prepareWrapper(wrapper) {
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

    return wrapper;
}

function intercept(fn) {
    var wrapper = proxy(fn, function (target) {
        var thisArg = this,
            args = Array.prototype.slice.call(arguments, 1);

        for (var i = 0; i < wrapper[beforeListeners].length; i++) {
            wrapper[beforeListeners][i].apply(thisArg, args);
        }

        var res = target.apply(thisArg, args);

        for (var j = 0; j < wrapper[afterListeners].length; j++) {
            wrapper[afterListeners][j].apply(thisArg, args);
        }

        return res;
    });

    return prepareWrapper(wrapper);
}

function interceptAsync(fn) {
    var wrapper = proxy(fn, function (target) {
        var thisArg = this,
            args = Array.prototype.slice.call(arguments, 1),
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

        return Promise.resolve(invoke(wrapper[beforeListeners]))
            .then(function () {
                return target.apply(thisArg, args);
            }).then(function (_res) {
                res = _res;
                return invoke(wrapper[afterListeners]);
            }).then(function () {
                return res;
            });
    });

    return prepareWrapper(wrapper);
}

function before(listener) {
    return (proto, prop) => {
        if (proto[prop][beforeListeners] === undefined) {
            proto[prop] = intercept(proto[prop]);
        }

        proto[prop].before(listener);
    }
}

function beforeAsync(listener) {
    return (proto, prop) => {
        if (proto[prop][beforeListeners] === undefined) {
            proto[prop] = interceptAsync(proto[prop]);
        }

        proto[prop].before(listener);
    }
}

function after(listener) {
    return (proto, prop) => {
        if (proto[prop][afterListeners] === undefined) {
            proto[prop] = intercept(proto[prop]);
        }

        proto[prop].after(listener);
    }
}

function afterAsync(listener) {
    return (proto, prop) => {
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