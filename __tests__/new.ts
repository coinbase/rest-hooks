import { AbstractInstanceType, SimpleRecord, schema } from '@rest-hooks/core';
import {
  Endpoint,
  EndpointExtraOptions,
  FetchFunction,
  Index,
} from '@rest-hooks/endpoint';
import { Resource, SimpleResource, RestEndpoint } from '@rest-hooks/rest';
import React, { createContext, useContext } from 'react';

export class UserResource extends Resource {
  readonly id: number | undefined = undefined;
  readonly username: string = '';
  readonly email: string = '';
  readonly isAdmin: boolean = false;

  pk() {
    return this.id?.toString();
  }

  static urlRoot = 'http://test.com/user/';
}
export class ArticleResource extends Resource {
  readonly id: number | undefined = undefined;
  readonly title: string = '';
  readonly content: string = '';
  readonly author: number | null = null;
  readonly tags: string[] = [];

  pk() {
    return this.id?.toString();
  }

  static schema = {
    author: UserResource,
  };

  static urlRoot = 'http://test.com/article/';
  static url<T extends typeof Resource>(this: T, urlParams?: any): string {
    if (urlParams && !urlParams.id) {
      return `${this.urlRoot}${urlParams.title}`;
    }
    return super.url(urlParams);
  }

  static longLiving<T extends typeof Resource>(this: T) {
    return this.detail().extend({
      dataExpiryLength: 1000 * 60 * 60,
    });
  }

  static neverRetryOnError<T extends typeof Resource>(this: T) {
    return this.detail().extend({
      errorExpiryLength: Infinity,
    });
  }

  static singleWithUser<T extends typeof ArticleResource>(this: T) {
    return this.detail().extend({
      url: (params: object) => this.url({ ...params, includeUser: true }),
    });
  }

  static listWithUser<T extends typeof ArticleResource>(this: T) {
    return this.list().extend({
      url: (
        params: Readonly<Record<string, string | number | boolean>> | undefined,
      ) => this.listUrl({ ...params, includeUser: true }),
    });
  }

  static partialUpdate<T extends typeof SimpleResource>(
    this: T,
  ): RestEndpoint<
    FetchFunction<object, RequestInit['body'] | Record<string, any>>,
    T,
    true
  > {
    return super.partialUpdate().extend({
      optimisticUpdate: (params: any, body: any) => ({
        id: params.id,
        ...body,
      }),
      schema: this,
    });
  }

  static delete<T extends typeof Resource>(this: T) {
    return super.delete().extend({
      optimisticUpdate: (params: any) => params,
      schema: new schema.Delete(this),
    });
  }
}

export const AuthContext = createContext('');

export class ContextAuthdArticle extends ArticleResource {
  /** Init options for fetch */
  static getFetchInit(init: RequestInit): RequestInit {
    /* eslint-disable-next-line */
    const accessToken = useContext(AuthContext);
    return {
      ...init,
      headers: {
        ...init.headers,
        'Access-Token': accessToken,
      },
    };
  }
}

export class ArticleTimedResource extends ArticleResource {
  readonly createdAt = new Date(0);

  static schema = {
    ...ArticleResource.schema,
    createdAt: Date,
  };

  static urlRoot = 'http://test.com/article-time/';
}

export class UrlArticleResource extends ArticleResource {
  readonly url: string = 'happy.com';
}

export class ArticleResourceWithOtherListUrl extends ArticleResource {
  static otherList<T extends typeof ArticleResourceWithOtherListUrl>(this: T) {
    return this.list().extend({
      url: () => this.urlRoot + 'some-list-url',
    });
  }

  static create<T extends typeof Resource>(this: T) {
    return super.create().extend({
      optimisticUpdate: (
        params: Readonly<object>,
        body: Readonly<object | string> | void,
      ) => body,
      schema: this,
    });
  }
}

export class CoolerArticleResource extends ArticleResource {
  static urlRoot = 'http://test.com/article-cooler/';
  get things() {
    return `${this.title} five`;
  }
}

export const CoolerArticleDetail = new Endpoint(({ id }: { id: number }) => {
  return fetch(`http://test.com/article-cooler/${id}`).then(res =>
    res.json(),
  ) as Promise<
    { [k in keyof CoolerArticleResource]: CoolerArticleResource[k] }
  >;
});

export class IndexedUserResource extends UserResource {
  static indexes = ['username' as const];

  static index() {
    return new Index(this);
  }
}

export class InvalidIfStaleArticleResource extends CoolerArticleResource {
  static getEndpointExtra(): EndpointExtraOptions {
    return {
      ...super.getEndpointExtra(),
      dataExpiryLength: 5000,
      errorExpiryLength: 5000,
      invalidIfStale: true,
    };
  }
}

export class PollingArticleResource extends ArticleResource {
  static getEndpointExtra(): EndpointExtraOptions {
    return {
      ...super.getEndpointExtra(),
      pollFrequency: 5000,
    };
  }

  static pusher<T extends typeof PollingArticleResource>(this: T) {
    return this.detail().extend({
      extra: {
        eventType: 'PollingArticleResource:fetch',
      },
    });
  }

  static anotherDetail<T extends typeof PollingArticleResource>(this: T) {
    return this.detail().extend({
      method: 'GET',
      schema: this,
    });
  }
}

export class StaticArticleResource extends ArticleResource {
  static urlRoot = 'http://test.com/article-static/';

  static EndpointExtraOptions() {
    return {
      ...super.getEndpointExtra(),
      dataExpiryLength: Infinity,
    };
  }
}

class OtherArticleResource extends CoolerArticleResource {}

function makePaginatedRecord<T>(entity: T) {
  return class PaginatedRecord extends SimpleRecord {
    readonly prevPage = '';
    readonly nextPage = '';
    readonly results: AbstractInstanceType<T>[] = [];
    static schema = { results: [entity] };
  };
}

export class PaginatedArticleResource extends OtherArticleResource {
  static urlRoot = 'http://test.com/article-paginated/';

  static list<T extends typeof Resource>(
    this: T,
  ): RestEndpoint<
    FetchFunction,
    { results: T[]; prevPage: string; nextPage: string },
    undefined
  > {
    return super.list().extend({
      schema: { results: [this], prevPage: '', nextPage: '' },
    });
  }

  static listDefaults<T extends typeof Resource>(this: T) {
    return super.list().extend({
      schema: makePaginatedRecord(this),
    });
  }

  static detail<T extends typeof Resource>(this: T) {
    return super.detail().extend({
      schema: { data: this },
    });
  }
}

export const ListPaginatedArticle = new Endpoint(
  (params: Readonly<Record<string, string | number>>) => {
    return PaginatedArticleResource.fetch(
      PaginatedArticleResource.listUrl(params),
      PaginatedArticleResource.getFetchInit({ method: 'GET' }),
    );
  },
  {
    schema: makePaginatedRecord(PaginatedArticleResource),
  },
);

export class UnionResource extends Resource {
  readonly id: string = '';
  readonly body: string = '';
  readonly type: string = '';

  pk() {
    return this.id;
  }

  static urlRoot = '/union/';

  static detail<T extends typeof Resource>(this: T) {
    return super.detail().extend({
      schema: new schema.Union(
        {
          first: FirstUnionResource,
          second: SecondUnionResource,
        },
        'type',
      ),
    });
  }

  static list<T extends typeof Resource>(this: T) {
    return super.list().extend({
      schema: [
        new schema.Union(
          {
            first: FirstUnionResource,
            second: SecondUnionResource,
          },
          (input: FirstUnionResource | SecondUnionResource) => input['type'],
        ),
      ],
    });
  }
}
export class FirstUnionResource extends UnionResource {
  readonly type = 'first' as const;
  readonly firstOnlyField: number = 5;
}
export class SecondUnionResource extends UnionResource {
  readonly type = 'second' as const;
  readonly secondeOnlyField: number = 10;
}

export class NestedArticleResource extends OtherArticleResource {
  readonly user: number | null = null;

  static schema = {
    ...OtherArticleResource.schema,
    user: UserResource,
  };
}

export const GetPhoto = new Endpoint(
  async function ({ userId }: { userId: string }) {
    const response = await fetch(this.key({ userId }));
    const photoArrayBuffer = await response.arrayBuffer();
    return photoArrayBuffer;
  },
  {
    key({ userId }: { userId: string }) {
      return `/users/${userId}/photo`;
    },
  },
);

export const GetNoEntities = new Endpoint(
  async function ({ userId }: { userId: string }) {
    return await (await fetch(`http://test.com/users/${userId}/simple`)).json();
  },
  {
    key({ userId }: { userId: string }) {
      return `/users/${userId}/simple`;
    },
    schema: { firstThing: '', someItems: [] as { a: number }[] },
  },
);

export function makeErrorBoundary(cb: (error: any) => void) {
  return class ErrorInterceptor extends React.Component<any, { error: any }> {
    state = { error: null };
    componentDidCatch(error: any) {
      this.setState({ error });
      cb(error);
    }

    render() {
      if (this.state.error) return null;
      return this.props.children;
    }
  };
}
