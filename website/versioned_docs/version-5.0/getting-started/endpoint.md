---
title: Endpoint
id: version-5.0-endpoint
original_id: endpoint
---

An endpoint is a way to retrieve data. Typically retrieved with a [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API).

```js
const fetchTodo = ({ id }) =>
  fetch(`https://jsonplaceholder.typicode.com/todos/${id}`).then(res =>
    res.json(),
  );
```

<details><summary><b>Sample</b></summary>
```js
console.log(await fetchTodo({ id: '1' }));
```
```json
{
  "userId": 1,
  "id": 1,
  "title": "delectus aut autem",
  "completed": false
}
```
</details>

We will likely want to use this endpoint in many places with differing needs.
By defining a reusable function of _just_ the network definition, we empower
its use in _any_ context.

This is especially useful when we start adding more information related to the
endpoint. For instance, TypeScript definitions help us avoid common mistakes, typos
and speed up development with autocomplete.

```typescript
interface Todo {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
}
interface Params {
  id: string;
}

const fetchTodo = ({ id }: Params): Promise<Todo> =>
  fetch(`https://jsonplaceholder.typicode.com/todos/${id}`).then(res =>
    res.json(),
  );
```

This is sufficient for building an application that simply spits out a
static html string. However, building rich applications based on dynamic
data introduces much more complexity. A good user experience
requires _consistency_ and _performance_.

However, to build a rich application based on dynamic data,

## other

> Just like you

sdf

<!--DOCUSAURUS_CODE_TABS-->
<!--TypeScript-->

```typescript
interface Todo {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
}

const fetchTodoList: () => Todo = () =>
  fetch('https://jsonplaceholder.typicode.com').then(res => res.json());

const TodoList = new Endpoint(fetchTodoList);
```

<!--JavaScript-->

```js
const fetchTodoList = () =>
  fetch('https://jsonplaceholder.typicode.com').then(res => res.json());

const TodoList = new Endpoint(fetchTodoList);
```

<!--END_DOCUSAURUS_CODE_TABS-->
