import importedCourseContent from "./content.json";
import foundationsOnlineContent from "./foundations-online-content.json";
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
  curriculum?: Array<{ title: string; lessons: string[] }>;
};

export const courseContents = (importedCourseContent as CourseContent[]).map((item) => item.slug === foundationsOnlineContent.slug ? {
  ...item,
  curriculum: foundationsOnlineContent.sections.map((section) => ({
    title: section.title,
    lessons: section.lessons.map((lesson) => lesson.title),
  })),
} : item);
