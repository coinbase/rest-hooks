---
title: Colocate Data Dependencies
sidebar_label: Data Dependencies
---

<!--DOCUSAURUS_CODE_TABS-->
<!--Single-->

```tsx
import { useResource } from 'rest-hooks';
// local directory for API definitions
import { todoDetail } from 'endpoints/todo';

export default function TodoDetail({ id }: { id: number }) {
  const todo = useResource(todoDetail, { id });
  return (
    <div>{todo.title}</div>
  );
}
```

<!--List-->

```tsx
import { useResource } from 'rest-hooks';
// local directory for API definitions
import { todoList } from 'endpoints/todo';

export default function TodoList() {
  const todos = useResource(todoList, {});
  return (
    <section>
      {todos.map(todo => <div key={todo.id}>{todo.title}</div>)}
    </section>
  );
}
```

<!--END_DOCUSAURUS_CODE_TABS-->

[useResource()](../api/useResource.md) guarantees access to data with sufficient [freshness](../api/Endpoint#dataexpirylength-number).
This means it may issue network calls, and it may [suspend](../guides/loading-state) until the the fetch completes.
Param changes will result in accessing the appropriate data, which also sometimes results in new network calls and/or
suspends.

- Fetches are centrally controlled, and thus automatically deduplicated
- Data is centralized and normalized guaranteeing consistency across uses, even with different [endpoints](../api/Endpoint).
  - (For example: navigating to a detail page with a single entry from a list view will instantly show the same data as the list without
    requiring a refetch.)
