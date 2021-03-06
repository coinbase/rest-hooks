import { ReadShape, ParamsFromShape } from '@rest-hooks/core/endpoint/index';
import { DenormalizeNullable } from '@rest-hooks/endpoint';
import { useDenormalized } from '@rest-hooks/core/state/selectors/index';
import { useContext, useMemo } from 'react';
import {
  DenormalizeCacheContext,
  StateContext,
} from '@rest-hooks/core/react-integration/context';
import {
  hasUsableData,
  useMeta,
  useError,
} from '@rest-hooks/core/react-integration/hooks/index';
import { denormalize, inferResults } from '@rest-hooks/normalizr';
import useExpiresAt from '@rest-hooks/core/react-integration/hooks/useExpiresAt';

/**
 * Access a resource if it is available.
 *
 * `useCache` guarantees referential equality globally.
 * @see https://resthooks.io/docs/api/useCache
 */
export default function useCache<
  Shape extends Pick<ReadShape<any, any>, 'getFetchKey' | 'schema' | 'options'>,
>(
  fetchShape: Shape,
  params: ParamsFromShape<Shape> | null,
): DenormalizeNullable<Shape['schema']> {
  const state = useContext(StateContext);
  const denormalizeCache = useContext(DenormalizeCacheContext);

  const [denormalized, ready, deleted, entitiesExpireAt] = useDenormalized(
    fetchShape,
    params,
    state,
    denormalizeCache,
  );
  const expiresAt = useExpiresAt(fetchShape, params, entitiesExpireAt);
  const error = useError(fetchShape, params);
  const trigger = deleted && !error;

  /*********** This block is to ensure results are only filled when they would not suspend **************/
  // This computation reflects the behavior of useResource/useRetrive
  // It only changes the value when expiry or params change.
  // This way, random unrelated re-renders don't cause the concept of expiry
  // to change
  const expired = useMemo(() => {
    if ((Date.now() <= expiresAt && !trigger) || !params) return false;
    return true;
    // we need to check against serialized params, since params can change frequently
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expiresAt, params && fetchShape.getFetchKey(params), trigger]);

  // if useResource() would suspend, don't include entities from cache
  if (
    !hasUsableData(
      fetchShape,
      ready,
      deleted,
      useMeta(fetchShape, params)?.invalidated,
    ) &&
    expired
  ) {
    return denormalize(
      inferResults(fetchShape.schema, [params], state.indexes),
      fetchShape.schema,
      {},
    )[0];
  }
  /*********************** end block *****************************/

  return denormalized;
}
