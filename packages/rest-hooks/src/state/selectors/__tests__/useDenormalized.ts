import {
  CoolerArticleResource,
  PaginatedArticleResource,
  NestedArticleResource,
  UserResource,
} from '__tests__/common';
import { normalize } from 'rest-hooks/resource';
import { initialState } from 'rest-hooks/state/reducer';

import { renderHook, act } from '@testing-library/react-hooks';
import { useState } from 'react';

import useDenormalized from '../useDenormalized';

describe('useDenormalized()', () => {
  describe('Single', () => {
    const params = { id: 5, title: 'bob', content: 'head' };
    const article = CoolerArticleResource.fromJS(params);
    describe('state is empty', () => {
      const state = initialState;
      const { result } = renderHook(() =>
        useDenormalized(CoolerArticleResource.detailShape(), { id: 5 }, state),
      );

      it('found should be false', () => {
        expect(result.current[1]).toBe(false);
      });

      it('should provide inferred results with undefined', () => {
        expect(result.current[0]).toMatchInlineSnapshot(`undefined`);
      });
    });
    describe('state is populated just not with our query', () => {
      const state = {
        ...initialState,
        entities: {
          [CoolerArticleResource.key]: {
            [params.id]: article,
          },
        },
        results: {
          [CoolerArticleResource.detailShape().getFetchKey(params)]: params.id,
        },
      };
      const { result } = renderHook(() =>
        useDenormalized(
          CoolerArticleResource.detailShape(),
          {
            id: 543345345345453,
          },
          state,
        ),
      );

      it('found should be false', () => {
        expect(result.current[1]).toBe(false);
      });

      it('should provide inferred results with undefined', () => {
        expect(result.current[0]).toMatchInlineSnapshot(`undefined`);
      });
    });
    describe('when state exists', () => {
      const state = {
        ...initialState,
        entities: {
          [CoolerArticleResource.key]: {
            [params.id]: article,
          },
        },
        results: {
          [CoolerArticleResource.detailShape().getFetchKey(params)]: params.id,
        },
      };
      const {
        result: {
          current: [value, found],
        },
      } = renderHook(() =>
        useDenormalized(CoolerArticleResource.detailShape(), params, state),
      );

      it('found should be true', () => {
        expect(found).toBe(true);
      });

      it('should provide inferred results', () => {
        expect(value).toBe(article);
      });
    });
    describe('without entity with defined results', () => {
      const state = {
        ...initialState,
        entities: { [CoolerArticleResource.key]: {} },
        results: {
          [CoolerArticleResource.detailShape().getFetchKey(params)]: params.id,
        },
      };
      const {
        result: {
          current: [value, found],
        },
      } = renderHook(() =>
        useDenormalized(CoolerArticleResource.detailShape(), params, state),
      );

      it('found should be false', () => {
        expect(found).toBe(false);
      });

      it('should provide inferred results with undefined', () => {
        expect(value).toMatchInlineSnapshot(`undefined`);
      });
    });
    describe('no result exists but primary key is used', () => {
      const state = {
        ...initialState,
        entities: {
          [CoolerArticleResource.key]: {
            [params.id]: article,
          },
        },
      };
      const {
        result: {
          current: [value, found],
        },
      } = renderHook(() =>
        useDenormalized(CoolerArticleResource.detailShape(), params, state),
      );

      it('found should be true', () => {
        expect(found).toBe(true);
      });

      it('should provide inferred results', () => {
        expect(value).toBe(article);
      });
    });
    describe('no result exists but primary key is used when using nested schema', () => {
      const pageArticle = PaginatedArticleResource.fromJS(article);
      const state = {
        ...initialState,
        entities: {
          [PaginatedArticleResource.key]: {
            [params.id]: pageArticle,
          },
        },
      };
      const {
        result: {
          current: [value, found],
        },
      } = renderHook(() =>
        useDenormalized(PaginatedArticleResource.detailShape(), params, state),
      );

      it('found should be true', () => {
        expect(found).toBe(true);
      });

      it('should provide inferred results', () => {
        expect(value.data).toBe(pageArticle);
      });
    });
    describe('not using primary key as param', () => {
      const urlParams = { title: 'bob' };
      const state = {
        ...initialState,
        entities: {
          [CoolerArticleResource.key]: {
            [params.id]: article,
          },
        },
        results: {
          [CoolerArticleResource.detailShape().getFetchKey(
            urlParams,
          )]: params.id,
        },
      };
      const {
        result: {
          current: [value, found],
        },
      } = renderHook(() =>
        useDenormalized(CoolerArticleResource.detailShape(), params, state),
      );

      it('found should be true', () => {
        expect(found).toBe(true);
      });

      it('should provide inferred results', () => {
        expect(value).toBe(article);
      });
    });
    it('should throw when results are Array', () => {
      const params = { title: 'bob' };
      const state = {
        ...initialState,
        results: {
          [CoolerArticleResource.detailShape().getFetchKey(params)]: [5, 6, 7],
        },
      };
      const { result } = renderHook(() =>
        useDenormalized(CoolerArticleResource.detailShape(), params, state),
      );
      expect(result.error).toBeDefined();
    });
    it('should throw when results are Object', () => {
      const params = { title: 'bob' };
      const state = {
        ...initialState,
        results: {
          [CoolerArticleResource.detailShape().getFetchKey(params)]: {
            results: [5, 6, 7],
          },
        },
      };
      const { result } = renderHook(() =>
        useDenormalized(CoolerArticleResource.detailShape(), params, state),
      );
      expect(result.error).toBeDefined();
    });
    describe('nested resources', () => {
      const nestedArticle = NestedArticleResource.fromJS({
        ...params,
        user: 23,
      });
      const user = UserResource.fromJS({ id: 23, username: 'anne' });

      const state = {
        ...initialState,
        entities: {
          [NestedArticleResource.key]: {
            [`${nestedArticle.pk()}`]: nestedArticle,
          },
          [UserResource.key]: { [`${user.pk()}`]: user },
        },
      };
      const {
        result: {
          current: [value, found],
        },
      } = renderHook(() =>
        useDenormalized(NestedArticleResource.detailShape(), params, state),
      );
      it('found should be true', () => {
        expect(found).toBe(true);
      });

      it('should provide inferred results', () => {
        expect(value).toMatchInlineSnapshot(`
          NestedArticleResource {
            "author": null,
            "content": "head",
            "id": 5,
            "tags": Array [],
            "title": "bob",
            "user": 23,
          }
        `);
      });
    });
  });

  describe('List', () => {
    const params = { things: 5 };
    const articles = [
      CoolerArticleResource.fromJS({ id: 5 }),
      CoolerArticleResource.fromJS({ id: 6 }),
      CoolerArticleResource.fromJS({ id: 34, title: 'five' }),
    ];
    describe('state is empty', () => {
      const state = initialState;
      const {
        result: {
          current: [value, found],
        },
      } = renderHook(() =>
        useDenormalized(PaginatedArticleResource.listShape(), {}, state),
      );

      it('found should be false', () => {
        expect(found).toBe(false);
      });

      it('should provide inferred results with undefined for entity', () => {
        expect(value).toMatchInlineSnapshot(`
          Object {
            "nextPage": "",
            "prevPage": "",
            "results": undefined,
          }
        `);
      });
    });
    describe('state is partial', () => {
      const { entities } = normalize(
        articles,
        CoolerArticleResource.listShape().schema,
      );
      const state = initialState;
      const {
        result: {
          current: [value, found],
        },
      } = renderHook(() =>
        useDenormalized(CoolerArticleResource.listShape(), {}, state),
      );

      it('found should be false', () => {
        expect(found).toBe(false);
      });

      it('should provide inferred results with undefined for entity', () => {
        expect(value).toMatchInlineSnapshot(`undefined`);
      });
    });
    describe('state exists', () => {
      const { entities, result: resultState } = normalize(
        articles,
        CoolerArticleResource.listShape().schema,
      );
      const state = {
        ...initialState,
        entities,
        results: {
          [CoolerArticleResource.listShape().getFetchKey(params)]: resultState,
        },
      };
      const {
        result: {
          current: [value, found],
        },
      } = renderHook(() =>
        useDenormalized(CoolerArticleResource.listShape(), params, state),
      );

      it('found should be true', () => {
        expect(found).toBe(true);
      });

      it('should provide inferred results', () => {
        expect(value).toEqual(articles);
      });
    });
    describe('missing some ids in entities table', () => {
      const { entities, result: resultState } = normalize(
        articles,
        CoolerArticleResource.listShape().schema,
      );
      delete entities[CoolerArticleResource.key]['5'];
      const state = {
        ...initialState,
        entities,
        results: {
          [CoolerArticleResource.listShape().getFetchKey(params)]: resultState,
        },
      };
      const {
        result: {
          current: [value, found],
        },
      } = renderHook(() =>
        useDenormalized(CoolerArticleResource.listShape(), params, state),
      );

      const expectedArticles = articles.slice(1);

      it('found should be true', () => {
        expect(found).toBe(true);
      });

      it('should simply ignore missing entities', () => {
        expect(value).toEqual(expectedArticles);
      });
    });
    describe('paginated results + missing some ids in entities table', () => {
      const { entities, result: resultState } = normalize(
        { results: articles },
        PaginatedArticleResource.listShape().schema,
      );
      delete entities[PaginatedArticleResource.key]['5'];
      const state = {
        ...initialState,
        entities,
        results: {
          [PaginatedArticleResource.listShape().getFetchKey(
            params,
          )]: resultState,
        },
      };
      const {
        result: {
          current: [value, found],
        },
      } = renderHook(() =>
        useDenormalized(PaginatedArticleResource.listShape(), params, state),
      );

      it('found should be true', () => {
        expect(found).toBe(true);
      });

      it('should match normalized articles', () => {
        const expectedArticles = articles.slice(1);
        expect(value.results).toEqual(expectedArticles);
      });
    });
    describe('paginated results', () => {
      const { entities, result: resultState } = normalize(
        { results: articles },
        PaginatedArticleResource.listShape().schema,
      );
      const state = {
        ...initialState,
        entities,
        results: {
          [PaginatedArticleResource.listShape().getFetchKey(
            params,
          )]: resultState,
        },
      };
      let result: any;

      beforeEach(() => {
        const v = renderHook(() => {
          const [usedState, setState] = useState(state);
          return {
            ret: useDenormalized(
              PaginatedArticleResource.listShape(),
              params,
              usedState,
            ),
            setState,
          };
        });
        result = v.result;
      });

      it('found should be true', () => {
        expect(result.current.ret[1]).toBe(true);
      });

      it('should match normalized articles', () => {
        expect(result.current.ret[0].results).toEqual(articles);
      });

      it('should stay referentially equal with external entity changes', () => {
        const prevValue = result.current.ret[0];
        act(() =>
          result.current.setState((state: any) => ({
            ...state,
            entities: { ...state.entities, whatever: {} },
          })),
        );
        expect(result.current.ret[0]).toBe(prevValue);

        act(() =>
          result.current.setState((state: any) => ({
            ...state,
            entities: {
              ...state.entities,
              [PaginatedArticleResource.key]: {
                ...state.entities[PaginatedArticleResource.key],
                100000: 'fake',
              },
            },
          })),
        );
        expect(result.current.ret[0]).toBe(prevValue);
      });

      it('should referentially change when an entity changes', () => {
        const prevValue = result.current.ret[0];
        act(() =>
          result.current.setState((state: any) => ({
            ...state,
            entities: {
              ...state.entities,
              [PaginatedArticleResource.key]: {
                ...state.entities[PaginatedArticleResource.key],
                '5': CoolerArticleResource.fromJS({ id: 5, title: 'five' }),
              },
            },
          })),
        );
        expect(result.current.ret[0]).not.toBe(prevValue);
      });

      it('should referentially change when the result extends', () => {
        const prevValue = result.current.ret[0];
        act(() =>
          result.current.setState((state: any) => ({
            ...state,
            results: {
              ...state.results,
              [PaginatedArticleResource.listShape().getFetchKey(params)]: {
                results: [...(resultState.results ?? []), '5'],
              },
            },
          })),
        );
        expect(result.current.ret[0]).not.toBe(prevValue);
        expect(result.current.ret[0]).toMatchSnapshot();
      });
    });

    describe('paginated results still loading', () => {
      const { entities, result: resultState } = normalize(
        { results: articles },
        PaginatedArticleResource.listShape().schema,
      );
      const state = {
        ...initialState,
        entities,
      };
      const {
        result: {
          current: [value, found],
        },
      } = renderHook(() =>
        useDenormalized(PaginatedArticleResource.listShape(), params, state),
      );

      it('found should be false', () => {
        expect(found).toBe(false);
      });

      it('value should be inferred for pagination primitives', () => {
        expect(value).toMatchInlineSnapshot(`
          Object {
            "nextPage": "",
            "prevPage": "",
            "results": undefined,
          }
        `);
      });
    });

    it('should throw with invalid schemas', () => {
      const shape = PaginatedArticleResource.listShape();
      shape.schema = { happy: { go: { lucky: 5 } } } as any;
      const { result } = renderHook(() =>
        useDenormalized(shape, params, {} as any),
      );
      expect(result.error).toBeDefined();
    });
  });
});
