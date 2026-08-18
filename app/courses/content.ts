import importedCourseContent from "./content.json";

export type CourseContent = {
  id: number;
  slug: string;
  sourceType: "course" | "product";
  sourceTitle: string;
  summary: string;
  cover: string;
  coverAlt: string;
  content: string;
};

export const courseContents = importedCourseContent as CourseContent[];

