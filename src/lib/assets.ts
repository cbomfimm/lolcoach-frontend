const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

/** Prepend basePath to public asset paths for static export (GitHub Pages). */
export const asset = (path: string) => `${BASE}${path}`;
