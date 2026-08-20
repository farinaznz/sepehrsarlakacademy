import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { normalizeCourseContent } from "./course-content.mjs";

const projectRoot = process.cwd();
const coursesFile = path.join(projectRoot, "app", "courses", "content.json");
const current = JSON.parse(await readFile(coursesFile, "utf8"));
const normalized = current.map(normalizeCourseContent);
await writeFile(coursesFile, `${JSON.stringify(normalized, null, 2)}\n`);
console.log(`Normalized ${normalized.length} course bodies.`);
