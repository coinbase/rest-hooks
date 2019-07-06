---
title: useSubscription()
---
```typescript
function useSubscription<
  Params extends Readonly<object>,
  Body extends Readonly<object> | void,
  S extends Schema
>(
  selectShape: ReadShape<S, Params, Body>,
  params: Params | null,
  body?: Body,
  active?: boolean = true,
): void;
```

Great for keeping resources up-to-date with frequent changes.

Frequency must be set in [FetchShape](./FetchShape.md), otherwise will have no affect.

## Example

`PriceResource.ts`

```typescript
import { Resource, RequestOptions } from 'rest-hooks';

export default class PriceResource extends Resource {
  readonly symbol: string | null = null;
  readonly price: string = '0.0';
  // ...

  pk() {
    return this.symbol;
  }
  static urlRoot = 'http://test.com/price/';

  /** Used as default options for every FetchShape */
  static getRequestOptions(): RequestOptions {
    return {
      pollFrequency: 5000, // every 5 seconds
    };
  }
}
```

`MasterPrice.tsx`

```tsx
import { useResource, useSubscription } from 'rest-hooks';
import PriceResource from 'resources/PriceResource';

function MasterPrice({ symbol }: { symbol: string }) {
  const price = useResource(PriceResource.singleRequest(), { symbol });
  useSubscription(PriceResource.singleRequest(), { symbol });
  // ...
}
```

## Only subscribe while element is visible

`MasterPrice.tsx`

```tsx
import { useRef } from 'react';
import { useResource, useSubscription } from 'rest-hooks';
import PriceResource from 'resources/PriceResource';

function MasterPrice({ symbol }: { symbol: string }) {
  const price = useResource(PriceResource.singleRequest(), { symbol });
  const ref = useRef();
  const onScreen = useOnScreen(ref);
  useSubscription(
    PriceResource.singleRequest(),
    { symbol },
    undefined,
    onScreen,
  );

  return (
    <div ref={ref}>
      {price.value.toLocaleString('en', { currency: 'USD' })}
    </div>
  );
}
```

Using the last argument `active` we control whether the subscription is active or not
based on whether the element rendered is [visible on screen](https://usehooks.com/useOnScreen/).

[useOnScreen()](https://usehooks.com/useOnScreen/) uses [IntersectionObserver](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API), which is very performant.

## Useful `FetchShape`s to send

[Resource](./Resource.md#provided-and-overridable-methods) provides these built-in:

- singleRequest()
- listRequest()

Be sure to extend these [FetchShape](./FetchShape.md)s with a pollFrequency to set
the polling-rate.
