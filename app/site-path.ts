const configuredBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const siteBasePath = configuredBasePath.endsWith("/")
  ? configuredBasePath.slice(0, -1)
  : configuredBasePath;

export function withBasePath(path: string): string {
  if (!siteBasePath || !path.startsWith("/") || path.startsWith("//")) return path;
  if (path === siteBasePath || path.startsWith(`${siteBasePath}/`)) return path;
  return `${siteBasePath}${path}`;
}
