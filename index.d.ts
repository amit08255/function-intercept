export interface Intercaptable {
    (...args): any;
    before(listener: (...args) => any): this;
    after(listener: (...args) => any): this;
}

export interface IntercaptableAsync extends Intercaptable {
    (...args): Promise<any>;
}

export type IntercaptableDecorator = (proto: any, prop: string) => void;

export function intercept(fn: (...args) => any): Intercaptable;
export function interceptAsync(fn: (...args) => any): IntercaptableAsync;
export function before(listener: (...args) => any): IntercaptableDecorator;
export function beforeAsync(listener: (...args) => any): IntercaptableDecorator;
export function after(listener: (...args) => any): IntercaptableDecorator;
export function afterAsync(listener: (...args) => any): IntercaptableDecorator;
export default intercept;