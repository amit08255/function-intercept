export interface Interceptable<T> {
    /** Returns the original function. */
    readonly target: T;
    /** Adds listeners that will be called before invoking the function. */
    before(listener: (...args) => void | false): this;
    /** Adds listeners that will be called after invoking the function. */
    after(listener: (...args) => void | false): this;
}

export interface InterceptableDecorator<T> {
    (proto: any, prop: string, desc?: PropertyDescriptor): void;
    /** Adds listeners that will be called before invoking the method. */
    before(listener: (this: T, ...args) => void | false): this;
    /** Adds listeners that will be called after invoking the method. */
    after(listener: (this: T, ...args) => void | false): this;
}

/** Intercepts the given function. */
export function intercept<T>(fn: T): T & Interceptable<T>;
/** Gets a chained interceptable decorator. */
export function intercept<T = any>(): InterceptableDecorator<T>;
/** Intercepts the given fuction and run actions asynchornously and sequencially. */
export function interceptAsync<T extends (...args) => any>(fn: T): (ReturnType<T> extends Promise<any> ? T : (...args) => Promise<ReturnType<T>>) & Interceptable<T>;
/** Gets a chained interceptable decorator and run actions asynchornously and sequencially. */
export function interceptAsync<T = any>(): InterceptableDecorator<T>;

export default intercept;