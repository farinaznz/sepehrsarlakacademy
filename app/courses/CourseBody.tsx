import type { CourseBodyBlock } from "./content-model";

function RichText({ html }: { html: string }) {
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

function BodyBlock({ block }: { block: CourseBodyBlock }) {
  switch (block.type) {
    case "paragraph":
      return <p className={block.lead ? "course-body-lead" : undefined}><RichText html={block.html} /></p>;
    case "heading":
      return block.level === 2
        ? <h2><RichText html={block.html} /></h2>
        : <h3><RichText html={block.html} /></h3>;
    case "list": {
      const List = block.style === "ordered" ? "ol" : "ul";
      return <List>{block.items.map((item, index) => <li key={index}><RichText html={item} /></li>)}</List>;
    }
    case "callout":
      return <aside className="course-body-callout"><RichText html={block.html} /></aside>;
    case "facts":
      return (
        <dl className="course-body-facts">
          {block.items.map((item) => <div key={item.label}><dt>{item.label}</dt><dd><RichText html={item.value} /></dd></div>)}
        </dl>
      );
    case "profile":
      return (
        <div className="course-body-profile">
          <img src={block.image.src} alt={block.image.alt} loading="lazy" />
          <p><RichText html={block.html} /></p>
        </div>
      );
  }
}

export function CourseBody({ blocks }: { blocks: CourseBodyBlock[] }) {
  return <div className="course-body">{blocks.map((block, index) => <BodyBlock key={`${block.type}-${index}`} block={block} />)}</div>;
}
