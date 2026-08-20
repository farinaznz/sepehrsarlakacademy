export type CourseImage = {
  src: string;
  alt: string;
};

export type CourseBodyBlock =
  | { type: "paragraph"; html: string; lead?: boolean }
  | { type: "heading"; level: 2 | 3; html: string }
  | { type: "list"; style: "ordered" | "unordered"; items: string[] }
  | { type: "callout"; html: string }
  | { type: "facts"; items: { label: string; value: string }[] }
  | { type: "profile"; image: CourseImage; html: string };
