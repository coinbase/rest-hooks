import { State, Manager } from '@rest-hooks/core';
import { SubscriptionManager } from 'rest-hooks';
import React from 'react';
import { renderHook, RenderHookOptions } from '@testing-library/react-hooks';

import { MockNetworkManager, MockPollingSubscription } from './managers';
import mockInitialState, { Fixture } from './mockState';

export default function makeRenderRestHook(
  makeProvider: (
    managers: Manager[],
    initialState?: State<unknown>,
  ) => React.ComponentType<{ children: React.ReactChild }>,
) {
  const manager = new MockNetworkManager();
  const subManager = new SubscriptionManager(MockPollingSubscription);
  function renderRestHook<P, R>(
    callback: (props: P) => R,
    options?: {
      initialProps?: P;
      results?: Fixture[];
      wrapper?: React.ComponentType<P>;
    },
  ) {
    const initialState =
      options && options.results && mockInitialState(options.results);
    const Provider: React.ComponentType<any> = makeProvider(
      [manager, subManager],
      initialState,
    );
    const Wrapper = options && options.wrapper;
    const wrapper: React.ComponentType<any> = Wrapper
      ? function ProviderWrapped(props: P) {
          return (
            <Provider>
              <Wrapper {...props} />
            </Provider>
          );
        }
      : Provider;
    return renderHook(callback, {
      ...options,
      wrapper,
    });
  }
  renderRestHook.cleanup = () => {
    manager.cleanup();
    subManager.cleanup();
  };
  return renderRestHook;
}
