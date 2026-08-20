import type { JournalBlock, RecipeDetails } from "./content-model";
import { withBasePath } from "../site-path";

function RichText({ html }: { html: string }) {
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

function RecipeFacts({ recipe }: { recipe?: RecipeDetails }) {
  if (!recipe || !Object.values(recipe).some(Boolean)) return null;
  const facts = [
    ["زمان", recipe.duration],
    ["تعداد سرو", recipe.servings],
    ["انرژی", recipe.calories],
  ].filter((fact): fact is [string, string] => Boolean(fact[1]));
  return (
    <dl className="recipe-facts">
      {facts.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
    </dl>
  );
}

function ContentBlock({ block }: { block: JournalBlock }) {
  switch (block.type) {
    case "paragraph":
      return <p className={block.lead ? "article-lead" : undefined}><RichText html={block.html} /></p>;
    case "heading":
      return block.level === 2
        ? <h2><RichText html={block.html} /></h2>
        : <h3><RichText html={block.html} /></h3>;
    case "list": {
      const List = block.style === "ordered" ? "ol" : "ul";
      return <List>{block.items.map((item, index) => <li key={index}><RichText html={item} /></li>)}</List>;
    }
    case "image":
      return (
        <figure className="article-media">
          <img src={withBasePath(block.src)} alt={block.alt} loading="lazy" />
          {block.caption ? <figcaption>{block.caption}</figcaption> : null}
        </figure>
      );
    case "video":
      return (
        <figure className="article-media">
          <video src={withBasePath(block.src)} aria-label={block.title} controls preload="metadata" />
        </figure>
      );
    case "quote":
      return <blockquote><RichText html={block.html} />{block.cite ? <cite>{block.cite}</cite> : null}</blockquote>;
    case "table":
      return (
        <div className="article-table-scroll" role="region" aria-label="جدول مقاله" tabIndex={0}>
          <table>
            <tbody>
              {block.rows.map((row, rowIndex) => (
                <tr key={rowIndex}>{row.map((cell, cellIndex) => {
                  const Cell = rowIndex < block.headerRows ? "th" : "td";
                  return <Cell key={cellIndex}><RichText html={cell} /></Cell>;
                })}</tr>
              ))}
            </tbody>
          </table>
        </div>
      );
  }
}

export function ArticleContent({ blocks, recipe }: { blocks: JournalBlock[]; recipe?: RecipeDetails }) {
  return (
    <div className="article-body">
      <RecipeFacts recipe={recipe} />
      {blocks.map((block, index) => <ContentBlock key={`${block.type}-${index}`} block={block} />)}
    </div>
  );
}
