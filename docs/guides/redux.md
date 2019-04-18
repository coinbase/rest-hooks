# Redux integration

Using redux is completely optional. However, for many it means easy integration or migration
with existing projects, or just a nice centralized state management abstraction.

Integration is fairly straightforward as rest-hooks already uses the same paradigms as redux under
the hood. However, care should be taken to integrate the reducer and middlewares properly
or it won't work as expected.

First make sure you have redux installed:

`yarn add redux`

Note: react-redux is _not_ needed for this integration (though you can use it if you want).

Then you'll want to use the [\<ExternalCacheProvider />](../ExternalCacheProvider.md) instead of [\<RestProvider />](../RestProvider.md) and pass in
the store and a selector function to grab the rest-hooks specific part of the state.

Note: You should only use ONE provider; using

`index.tsx`

```tsx
import {
  reducer,
  NeworkManager,
  SubscriptionManager,
  PollingSubscription,
  ExternalCacheProvider,
} from 'rest-hooks';
import { createStore } from 'redux';
import ReactDOM from 'react-dom';

const manager = new NetworkManager();
const subscriptionManager = new SubscriptionManager(PollingSubscription);

const store = createStore(
  reducer,
  applyMiddleware(manager.getMiddleware(), subscriptionManager.getMiddleware()),
);

ReactDOM.render(
  <ExternalCacheProvider store={store} selector={s => s}>
    <App />
  </ExternalCacheProvider>,
  document.body,
);
```

Above we have the simplest case where the entire redux store is used for rest-hooks.
However, more commonly you will be integrating with other state. In this case, you
will need to use the `selector` prop of `<ExternalCacheProvider />` to specify
where in the state tree the rest-hooks information is.

```tsx
import {
  reducer as restReducer,
  NeworkManager,
  SubscriptionManager,
  PollingSubscription,
  ExternalCacheProvider,
} from 'rest-hooks';
import { createStore, combineReducers } from 'redux';
import ReactDOM from 'react-dom';

const manager = new NetworkManager();
const subscriptionManager = new SubscriptionManager(PollingSubscription);

const store = createStore(
  // Now we have other reducers
  combineReducers({
    restHooks: restReducer,
    myOtherState: otherReducer,
  }),
  applyMiddleware(manager.getMiddleware(), subscriptionManager.getMiddleware()),
);

ReactDOM.render(
  // Our selector gets the part of the tree rest-hooks cares about.
  <ExternalCacheProvider store={store} selector={s => s.restHooks}>
    <App />
  </ExternalCacheProvider>,
  document.body,
);
```

Here we store rest-hooks state information in the 'restHooks' part of the tree.
