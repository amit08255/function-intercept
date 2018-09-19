export interface Intercaptable {
    (...args): any;
    before(listener: (...args) => any): this;
    after(listener: (...args) => any): this;
}

export interface IntercaptableAsync extends Intercaptable {
    (...args): Promise<any>;
}

export function intercept(fn: (...args) => any): Intercaptable;
export function interceptAsync(fn: (...args) => any): IntercaptableAsync;
export default intercept;