import {
    Callable,
    Asynchronize,
    PreIntercepter,
    AsyncPreIntercepter,
    PostIntercepter,
    AsyncPostIntercepter,
    Interceptable,
    InterceptableAsync,
    InterceptableDecorator,
    InterceptableAsyncDecorator
} from "./header";

export {
    Callable,
    Asynchronize,
    PreIntercepter,
    AsyncPreIntercepter,
    PostIntercepter,
    AsyncPostIntercepter,
    Interceptable,
    InterceptableAsync,
    InterceptableDecorator,
    InterceptableAsyncDecorator
};

const pre = Symbol("preHanlders");
const post = Symbol("postHandlers");

function before(
    this: Callable & { [pre]: Callable[] },
    handler: PreIntercepter | AsyncPreIntercepter
) {
    this[pre].push(handler);
    return this;
}

function after(
    this: Callable & { [post]: Callable[] },
    handler: PostIntercepter | AsyncPostIntercepter
) {
    this[post].push(handler);
    return this;
}

function set(
    target: Callable,
    prop: string | symbol,
    value: any,
    writable = false
) {
    Object.defineProperty(target, prop, {
        configurable: true,
        enumerable: false,
        writable: !!writable,
        value: value
    });
}

function setup(wrapper: Callable) {
    set(wrapper, pre, []);
    set(wrapper, post, []);
    set(wrapper, "before", before, true);
    set(wrapper, "after", after, true);

    return wrapper;
}

function proxy(
    target: Callable & { intercepted?: boolean },
    handler: Callable,
    async = false
) {
    if (typeof target != "function") {
        throw new TypeError("the target to intercept must be a function");
    } else if (target.constructor.name == "GeneratorCallable") {
        throw new TypeError("the target to intercept must not be a generator function");
    } else if (target.toString().slice(0, 6) == "class ") {
        throw new TypeError("the target to intercept must not be a class");
    } else if (target.intercepted) {
        // if the target is already intercepted, return it without modifying.
        return target;
    }

    function wrapper(this: any) {
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
    set(wrapper, "toString", function toString(this: any) {
        let str = this.target.toString(),
            isAsync = str.slice(0, 6) == "async ";

        return (isAsync || !async) ? str : "async " + str;

    }, true);

    return wrapper;
}

function decorate(handler: Callable, async = false) {
    function decorator(
        proto: any,
        prop: string,
        desc: TypedPropertyDescriptor<any>
    ) {
        let wrapper = desc.value.intercepted
            ? desc.value
            : proxy(desc.value, handler, async);

        set(wrapper, pre, wrapper[pre].concat(decorator[pre]));
        set(wrapper, post, wrapper[post].concat(decorator[post]));

        desc.value = proto[prop] = wrapper;
    };

    return setup(decorator);
}


/** Intercepts the given function. */
export function intercept<T extends Callable>(fn: T): T & Interceptable<T>;
/** Gets a chained interceptable decorator. */
export function intercept<T extends Callable>(): InterceptableDecorator<T>;
export function intercept(target?: Callable): any {
    function handler(this: any, target: Callable, thisArg: any, args: any[]) {
        for (let handler of this[pre]) {
            let returns = (<Callable>handler).apply(thisArg, args);

            if (intercept.BREAK === returns)
                return;
            else if (Array.isArray(returns))
                args = returns;
        }

        let res = target.apply(thisArg, args);

        for (let handler of this[post]) {
            let returns = (<Callable>handler).call(thisArg, res);

            if (intercept.BREAK === returns)
                break;
            else if (returns !== void 0)
                res = returns;
        }

        return res;
    };

    return target ? proxy(target, handler) : decorate(handler);
}

/** Intercepts the given function and run actions asynchronously and sequentially. */
export function interceptAsync<T extends Callable>(fn: T): Asynchronize<T> & InterceptableAsync<T>;
/** Gets a chained interceptable decorator and run actions asynchronously and sequentially. */
export function interceptAsync<T extends Callable>(): InterceptableAsyncDecorator<T>;
export function interceptAsync(target?: Callable): any {
    async function handler(this: any, target: Callable, thisArg: any, args: any[]) {
        for (let handler of this[pre]) {
            let returns = await (<Callable>handler).apply(thisArg, args);

            if (intercept.BREAK === returns)
                return;
            else if (Array.isArray(returns))
                args = returns;
        }

        let res = await target.apply(thisArg, args);

        for (let handler of this[post]) {
            let returns = await (<Callable>handler).call(thisArg, res);

            if (intercept.BREAK === returns)
                break;
            else if (returns !== void 0)
                res = returns;
        }

        return res;
    };

    return target ? proxy(target, handler, true) : decorate(handler, true);
}

export namespace intercept {
    export const BREAK = Symbol("intercept.BREAK");
}

export default intercept;