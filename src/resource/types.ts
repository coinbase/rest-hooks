import { schemas, Schema, SchemaList, SchemaDetail } from './normal';
import { FetchOptions } from '~/types';

/** Defines the shape of a network request */
export interface FetchShape<
  S extends Schema,
  Params extends Readonly<object> = Readonly<object>,
  Body extends Readonly<object | string> | void =
    | Readonly<object | string>
    | undefined
> {
  readonly type: 'read' | 'mutate' | 'delete';
  fetch(params: Params, body: Body): Promise<any>;
  getFetchKey(params: Params): string;
  readonly schema: S;
  readonly options?: FetchOptions;
}

export type SchemaFromShape<
  F extends FetchShape<any, any, any>
> = F extends FetchShape<infer S, any, any> ? S : never;
export type ParamsFromShape<
  F extends FetchShape<any, any, any>
> = F extends FetchShape<any, infer P, any> ? P : never;
export type BodyFromShape<
  F extends FetchShape<any, any, any>
> = F extends FetchShape<any, any, infer B> ? B : never;

/** Purges a value from the server */
export interface DeleteShape<
  S extends schemas.Entity,
  Params extends Readonly<object> = Readonly<object>,
  Body extends Readonly<object | string> | void = undefined
> extends FetchShape<S, Params, Body> {
  readonly type: 'delete';
}

/** To change values on the server */
export interface MutateShape<
  S extends Schema,
  Params extends Readonly<object> = Readonly<object>,
  Body extends Readonly<object | string> | void =
    | Readonly<object | string>
    | undefined
> extends FetchShape<S, Params, Body> {
  readonly type: 'mutate';
  fetch(
    params: Params,
    body: Body,
  ): Promise<object | string | number | boolean>;
}

/** For retrieval requests */
export interface ReadShape<
  S extends Schema,
  Params extends Readonly<object> = Readonly<object>
> extends FetchShape<S, Params, undefined> {
  readonly type: 'read';
  fetch(params: Params): Promise<object | string | number | boolean>;
}

export function isDeleteShape(
  shape: FetchShape<any, any, any>,
): shape is DeleteShape<any, any> {
  return shape.type === 'delete';
}

export type ResultShape<RS> = RS extends { schema: infer U } ? U : never;
export type SelectReturn<RS> = RS extends {
  select: (...args: any[]) => infer U;
}
  ? U
  : never;
export type AlwaysSelect<RS> = NonNullable<SelectReturn<RS>>;
export type ParamArg<RS> = RS extends {
  getFetchKey: (params: infer U) => any;
}
  ? U
  : never;
export type BodyArg<RS> = RS extends {
  fetch: (url: any, body: infer U) => any;
}
  ? U
  : never;
export type RequestResource<RS> = SchemaOf<ResultShape<RS>>;

export function isEntity<T>(schema: Schema<T>): schema is schemas.Entity<T> {
  return (schema as schemas.Entity).key !== undefined;
}

export type SchemaOf2<T> = T extends SchemaList<infer R>
  ? R[]
  : T extends SchemaDetail<infer R>
  ? R
  : never;

export type SchemaOf<S> = Extract<S, schemas.Entity<any>> extends never
  ? (S extends (infer I)[] | schemas.Array<infer I>
      ? SchemaOf2<Extract<I, schemas.Entity<any>>>[]
      : SchemaOf2<S>)
  : SchemaOf2<Extract<S, schemas.Entity<any>>>;