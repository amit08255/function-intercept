export type Callable = (...args: any[]) => any;

export type Asynchronize<T extends Callable> =
    ReturnType<T> extends Promise<any>
    ? T
    : (...args: Parameters<T>) => Promise<ReturnType<T>>;

export type ResolveType<T extends Callable> =
    ReturnType<T> extends Promise<infer U> ? U : ReturnType<T>;

export type PreReturnType<T extends Callable> = symbol | void | Parameters<T>;

export type PostReturnType<T extends Callable> = symbol | void | ResolveType<T>;

export type PreIntercepter<T extends Callable = Callable> =
    (...args: Parameters<T>) => PreReturnType<T>;

export type PostIntercepter<T extends Callable = Callable> =
    (returns: ReturnType<T>) => symbol | void | ReturnType<T>;

export type AsyncPreIntercepter<T extends Callable = Callable> =
    (...args: Parameters<T>) => PreReturnType<T> | Promise<PreReturnType<T>>;

export type AsyncPostIntercepter<T extends Callable = Callable> =
    (returns: ResolveType<T>) => PostReturnType<T> | Promise<PostReturnType<T>>;

export interface Interceptable<T extends Callable = Callable> {
    /** Returns the original function. */
    readonly target: T;
    /** Adds handlers that will be called before invoking the function. */
    before(handler: PreIntercepter<T>): this;
    /** Adds handlers that will be called after invoking the function. */
    after(handler: PostIntercepter<T>): this;
}

export interface InterceptableAsync<T extends Callable = Callable> {
    /** Returns the original function. */
    readonly target: T;
    /** Adds handlers that will be called before invoking the function. */
    before(handler: AsyncPreIntercepter<T>): this;
    /** Adds handlers that will be called after invoking the function. */
    after(handler: AsyncPostIntercepter<T>): this;
}

export interface InterceptableDecorator<T extends Callable = Callable> {
    (proto: any, prop: string, desc?: PropertyDescriptor): void;
    /** Adds handlers that will be called before invoking the method. */
    before(handler: PreIntercepter<T>): this;
    /** Adds handlers that will be called after invoking the method. */
    after(handler: PostIntercepter<T>): this;
}

export interface InterceptableAsyncDecorator<T extends Callable = Callable> {
    (proto: any, prop: string, desc?: PropertyDescriptor): void;
    /** Adds handlers that will be called before invoking the method. */
    before(handler: AsyncPreIntercepter<T>): this;
    /** Adds handlers that will be called after invoking the method. */
    after(handler: AsyncPostIntercepter<T>): this;
}