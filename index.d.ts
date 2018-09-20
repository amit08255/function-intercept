export interface Intercaptable {
    (...args): any;
    before(listener: (...args) => any): this;
    after(listener: (...args) => any): this;
}

export interface AsyncIntercaptable extends Intercaptable {
    (...args): Promise<any>;
}

export interface IntercaptableDecorator extends Intercaptable {
    (proto: any, prop: string): void
}

export function intercept(fn: (...args) => any): Intercaptable;
export function intercept(): IntercaptableDecorator;
export function interceptAsync(fn: (...args) => any): AsyncIntercaptable;
export function interceptAsync(): IntercaptableDecorator;
export default intercept;