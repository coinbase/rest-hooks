---
title: useDebounce()
id: version-5.0-useDebounce
original_id: useDebounce
---

```typescript
function useDebounce<T>(value: T, delay: number, updatable?: boolean): T;
```

Delays updating the parameters by [debouncing](https://css-tricks.com/debouncing-throttling-explained-examples/).
Useful to avoid spamming network requests when parameters might change quickly (like a typeahead field).

```typescript
import { useDebounce } from '@rest-hooks/hooks';
import { useResource } from 'rest-hooks';

const debouncedFilter = useDebounce(filter, 200);
const data = useResource(MyEndpoint, { filter: debouncedFilter });
```

Part of [@rest-hooks/hooks](https://www.npmjs.com/package/@rest-hooks/hooks)
