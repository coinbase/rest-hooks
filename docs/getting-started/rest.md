<!--DOCUSAURUS_CODE_TABS-->
<!--Single-->

```tsx
import { useResource } from 'rest-hooks';
import ArticleResource from 'resources/article';

export default function ArticleDetail({ id }: { id: number }) {
  const article = useResource(ArticleResource.detail(), { id });
  return (
    <article>
      <h2>{article.title}</h2>
      <div>{article.content}</div>
    </article>
  );
}
```

<!--List-->

```tsx
import { useResource } from 'rest-hooks';
import ArticleResource from 'resources/article';
import ArticleSummary from './ArticleSummary';

export default function ArticleList({ sortBy }: { sortBy: string }) {
  const articles = useResource(ArticleResource.list(), { sortBy });
  return (
    <section>
      {articles.map(article => (
        <ArticleSummary key={article.pk()} article={article} />
      ))}
    </section>
  );
}
```

<!--END_DOCUSAURUS_CODE_TABS-->
