import { State } from '@rest-hooks/core/types';
import { ReadShape, ParamsFromShape } from '@rest-hooks/core/endpoint/index';
import { DenormalizeNullable } from '@rest-hooks/endpoint';
import { isEntity, Schema } from '@rest-hooks/endpoint';
import {
  DenormalizeCache,
  WeakListMap,
  denormalize,
  inferResults,
} from '@rest-hooks/normalizr';
import { useMemo } from 'react';

/**
 * Selects the denormalized form from `state` cache.
 *
 * If `result` is not found, will attempt to generate it naturally
 * using params and schema. This increases cache hit rate for many
 * detail shapes.
 *
 * @returns [denormalizedValue, ready]
 */
export default function useDenormalized<
  Shape extends Pick<
    ReadShape<Schema | undefined, any>,
    'getFetchKey' | 'schema' | 'options'
  >,
>(
  { schema, getFetchKey }: Shape,
  params: ParamsFromShape<Shape> | null,
  state: State<any>,
  denormalizeCache: DenormalizeCache = { entities: {}, results: {} },
): [
  denormalized: DenormalizeNullable<Shape['schema']>,
  found: typeof params extends null ? false : boolean,
  deleted: boolean,
  entitiesExpireAt: number,
] {
  const entities = state.entities;
  const entityMeta = state.entityMeta;
  const cacheResults = params && state.results[getFetchKey(params)];
  const serializedParams = params && getFetchKey(params);

  // We can grab entities without actual results if the params compute a primary key
  const results = useMemo(() => {
    if (cacheResults || schema === undefined) return cacheResults;

    // in case we don't even have entities for a model yet, denormalize() will throw
    // entities[entitySchema.key] === undefined
    return inferResults(schema, [params], state.indexes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheResults, state.indexes, serializedParams]);
  // TODO: only update when relevant indexes change

  const needsDenormalization = useMemo(
    () => schema && schemaHasEntity(schema),
    [schema],
  );

  // Compute denormalized value
  return useMemo(() => {
    if (!needsDenormalization) {
      return [results, cacheResults !== undefined, false, 0] as [
        DenormalizeNullable<Shape['schema']>,
        any,
        boolean,
        number,
      ];
    }
    // Warn users with bad configurations
    /* istanbul ignore next */
    if (process.env.NODE_ENV !== 'production' && schema && isEntity(schema)) {
      const paramEncoding = serializedParams || '';
      if (Array.isArray(results)) {
        throw new Error(
          `fetch key ${paramEncoding} has list results when single result is expected`,
        );
      }
      if (typeof results === 'object') {
        throw new Error(
          `fetch key ${paramEncoding} has object results when single result is expected`,
        );
      }
    }

    if (params && !denormalizeCache.results[getFetchKey(params)])
      denormalizeCache.results[getFetchKey(params)] = new WeakListMap();

    // second argument is false if any entities are missing
    // eslint-disable-next-line prefer-const
    const [value, found, deleted, resolvedEntities] = denormalize(
      results,
      schema,
      entities,
      denormalizeCache.entities,
      params ? denormalizeCache.results[getFetchKey(params)] : undefined,
    ) as [
      DenormalizeNullable<Shape['schema']>,
      boolean,
      boolean,
      Record<string, Record<string, any>>,
    ];

    // only require finding all entities if we are inferring results
    // deletion is separate count, and thus will still trigger
    // if we remove cacheResults escape here, we need to validate we don't infinite loop
    // in packages/core/src/react-integration/__tests__/useResource.web.tsx
    const ready = !!cacheResults || found;

    // oldest entity dictates age
    let expiresAt = Infinity;
    if (ready) {
      // using Object.keys ensures we don't hit `toString` type members
      Object.keys(resolvedEntities).forEach(key =>
        Object.keys(resolvedEntities[key]).forEach(pk => {
          expiresAt = Math.min(expiresAt, entityMeta[key][pk].expiresAt);
        }),
      );
    } else {
      expiresAt = 0;
    }

    return [value, ready, deleted, expiresAt];
    // TODO: would be nice to make this only recompute on the entity types that are in schema
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    entities,
    entityMeta,
    serializedParams,
    results,
    cacheResults,
    needsDenormalization,
  ]);
}

/** Determine whether the schema has any entities.
 *
 * Without entities, denormalization is not needed, and results should not be inferred.
 */
function schemaHasEntity(schema: Schema): boolean {
  if (isEntity(schema)) return true;
  if (Array.isArray(schema))
    return schema.length !== 0 && schemaHasEntity(schema[0]);
  if (schema && (typeof schema === 'object' || typeof schema === 'function')) {
    const nestedSchema =
      'schema' in schema ? (schema.schema as Record<string, Schema>) : schema;
    if (typeof nestedSchema === 'function') {
      return schemaHasEntity(nestedSchema);
    }
    return Object.values(nestedSchema).reduce(
      (prev, cur) => prev || schemaHasEntity(cur),
      false,
    );
  }
  return false;
}
