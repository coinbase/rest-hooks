## 🏁 Getting Started

- [Installation](getting-started/installation.md)
- [Usage](getting-started/usage.md)

## 💬 API

- [Resource](api/Resource.md)
  - [RequestShape](api/RequestShape.md)
- Hooks:
  - [useResource](api/useResource.md)
  - [useFetcher](api/useFetcher.md)
  - [useCache](api/useCache.md)
  - [useResultCache](api/useResultCache.md)
  - [useRetrieve](api/useRetrieve.md)
- Components:
  - [RestProvider](api/RestProvider.md)
  - [NetworkErrorBoundary](api/NetworkErrorBoundary.md)

## 🎎 Patterns & Examples

- 🔰 Basics
  - [Handling loading state](guides/loading-state.md)
  - [Dealing with network errors](guides/network-errors.md)
  - [Fetching multiple resources at once](guides/fetch-multiple.md)
  - [Pagination](guides/pagination.md)
  - [Understanding Immutability](guides/immutability.md)
- 🖧 Defining your network interface
  - [Defining your Resource types](guides/resource-types.md)
  - [Computed properties](guides/computed-properties.md)
  - [Multicolumn primary keys](guides/multi-pk.md)
  - [Transforming data on network load](guides/network-transform.md)
  - [Authentication](guides/auth.md)
  - [Cross-orgin requests with JSONP](guides/jsonp.md)
  - [Custom networking library](guides/custom-networking.md)
  - [Custom cache lifetime](guides/resource-lifetime.md)
- 💨 Performance Optimizations (optional)
  - [Nesting related resources (server-side join)](guides/nested-response.md)
  - [Cross-resource multi-update RPC (dealing with side-effects)](guides/rpc.md)
