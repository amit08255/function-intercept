"use strict";

const beforeListeners = Symbol("beforeListeners");
const afterListeners = Symbol("afterListeners");

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
    let wrapper = new Proxy(fn, {
        apply: (target, thisArg, args) => {
            wrapper[beforeListeners].forEach(listener => {
                listener.apply(thisArg, args);
            });

            let res = target.apply(thisArg, args);

            wrapper[afterListeners].forEach(listener => {
                listener.apply(thisArg, args);
            });

            return res;
        }
    });

    return prepareWrapper(wrapper);
}

function interceptAsync(fn) {
    let wrapper = new Proxy(fn, {
        apply: (target, thisArg, args) => {
            let res = void 0,
                invoke = (listeners, index = 0) => {
                    if (index >= listeners.length) return;

                    let listener = listeners[index];

                    return Promise.resolve(listener.apply(thisArg, args))
                        .then(() => invoke(listeners, index + 1));
                };

            return Promise.resolve(invoke(wrapper[beforeListeners]))
                .then(() => target.apply(thisArg, args))
                .then(_res => {
                    res = _res;
                    return invoke(wrapper[afterListeners]);
                }).then(() => res);
        }
    });

    return prepareWrapper(wrapper);
}

function before(listener) {
    return (proto, prop) => {
        if (!Array.isArray(proto[prop][beforeListeners])) {
            proto[prop] = intercept(proto[prop]);
        }

        proto[prop].before(listener);
    }
}

function beforeAsync(listener) {
    return (proto, prop) => {
        if (!Array.isArray(proto[prop][beforeListeners])) {
            proto[prop] = interceptAsync(proto[prop]);
        }

        proto[prop].before(listener);
    }
}

function after(listener) {
    return (proto, prop) => {
        if (!Array.isArray(proto[prop][beforeListeners])) {
            proto[prop] = intercept(proto[prop]);
        }

        proto[prop].after(listener);
    }
}

function afterAsync(listener) {
    return (proto, prop) => {
        if (!Array.isArray(proto[prop][beforeListeners])) {
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