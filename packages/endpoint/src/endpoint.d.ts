/* eslint-disable @typescript-eslint/ban-types */
import { Schema } from '@rest-hooks/normalizr';

import { EndpointInterface } from './interface';

export interface EndpointExtraOptions {
  /** Default data expiry length, will fall back to NetworkManager default if not defined */
  readonly dataExpiryLength?: number;
  /** Default error expiry length, will fall back to NetworkManager default if not defined */
  readonly errorExpiryLength?: number;
  /** Poll with at least this frequency in miliseconds */
  readonly pollFrequency?: number;
  /** Marks cached resources as invalid if they are stale */
  readonly invalidIfStale?: boolean;
  /** Enables optimistic updates for this request - uses return value as assumed network response */
  readonly optimisticUpdate?: (
    params: Readonly<object>,
    body: Readonly<object | string> | void,
  ) => any;
  /** User-land extra data to send */
  readonly extra?: any;
}

export interface EndpointOptions<
  K extends (params: any) => string,
  S extends Schema | undefined = Schema | undefined,
  M extends true | undefined = undefined
> extends EndpointExtraOptions {
  key?: K;
  sideEffect?: M;
  schema?: S;
}

export interface EndpointExtendOptions<
  K extends (params: any) => string,
  S extends Schema | undefined = Schema | undefined,
  M extends true | undefined = undefined
> extends EndpointOptions<K, S, M> {
  fetch?: FetchFunction;
}

export type ParamFromFetch<F> = F extends (
  params: infer P,
  body?: any,
) => Promise<any>
  ? P
  : never;

type Overwrite<T, U> = Pick<T, Exclude<keyof T, keyof U>> & U;
export type FetchFunction<P = any> = (params?: P, body?: any) => Promise<any>;

/**
 * Creates a new function.
 */
interface EndpointInstance<
  F extends FetchFunction,
  S extends Schema | undefined = undefined,
  M extends true | undefined = undefined
> extends EndpointInterface<F, S, M> {
  /**
   * Calls the function, substituting the specified object for the this value of the function, and the specified array for the arguments of the function.
   * @param thisArg The object to be used as the this object.
   * @param argArray A set of arguments to be passed to the function.
   */
  apply(this: F, thisArg: ThisParameterType<F>, argArray?: Parameters<F>): any;

  /**
   * Calls a method of an object, substituting another object for the current object.
   * @param thisArg The object to be used as the current object.
   * @param argArray A list of arguments to be passed to the method.
   */
  call(this: F, thisArg: ThisParameterType<F>, ...argArray: Parameters<F>): any;

  /**
   * For a given function, creates a bound function that has the same body as the original function.
   * The this object of the bound function is associated with the specified object, and has the specified initial parameters.
   * @param thisArg An object to which the this keyword can refer inside the new function.
   * @param argArray A list of arguments to be passed to the new function.
   */
  bind(this: F, thisArg: ThisParameterType<F>, ...argArray: Parameters<F>): any;

  /** Returns a string representation of a function. */
  toString(): string;

  prototype: any;
  readonly length: number;

  // Non-standard extensions
  arguments: any;
  caller: F;

  key(...args: Parameters<F>): string;

  readonly sideEffect?: M;

  readonly schema?: S;

  fetch: F;

  extend<
    E extends EndpointInstance<any, any, any>,
    O extends EndpointExtendOptions<K, any, any>,
    K extends (
      this: ThisParameterType<
        'fetch' extends keyof O ? O['fetch'] : E['fetch']
      >,
      params: ParamFromFetch<'fetch' extends keyof O ? O['fetch'] : E['fetch']>,
    ) => string
  >(
    this: E,
    options: O,
  ): EndpointInstance<
    'fetch' extends keyof typeof options ? typeof options['fetch'] : E['fetch'],
    'schema' extends keyof typeof options
      ? typeof options['schema']
      : E['schema'],
    'sideEffect' extends keyof typeof options
      ? typeof options['sideEffect']
      : E['sideEffect']
  > & { prototype: E };
}

interface EndpointConstructor {
  new <
    F extends (params?: any, body?: any) => Promise<any>,
    S extends Schema | undefined = undefined,
    M extends true | undefined
  >(
    fetchFunction: F,
    options?: EndpointOptions<
      (this: ThisParameterType<F>, ...args: Parameters<F>) => string,
      S,
      M
    > &
      ThisParameterType<F>,
  ): EndpointInstance<F, S, M>;
  readonly prototype: Function;
}

declare let Endpoint: EndpointConstructor;

export default Endpoint;
