export interface Interceptable {
    before(listener: (...args) => void | false): this;
    after(listener: (...args) => void | false): this;
}

export interface InterceptableDecorator<T> {
    (proto: any, prop: string, desc?: PropertyDescriptor): void;
    before(listener: (this: T, ...args) => void | false): this;
    after(listener: (this: T, ...args) => void | false): this;
}

export function intercept<T>(fn: T): T & Interceptable;
export function intercept<T = any>(): InterceptableDecorator<T>;
export function interceptAsync<T extends (...args) => any>(fn: T): (ReturnType<T> extends Promise<any> ? T : (...args) => Promise<ReturnType<T>>) & Interceptable;
export function interceptAsync<T = any>(): InterceptableDecorator<T>;

export default intercept;