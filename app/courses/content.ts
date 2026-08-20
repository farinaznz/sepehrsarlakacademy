import importedCourseContent from "./content.json";
import type { CourseBodyBlock, CourseImage } from "./content-model";

export type CourseContent = {
  id: number;
  slug: string;
  sourceType: "course" | "product";
  sourceTitle: string;
  summary: string;
  cover: string;
  coverAlt: string;
  gallery: CourseImage[];
  body: CourseBodyBlock[];
};

export const courseContents = importedCourseContent as CourseContent[];
