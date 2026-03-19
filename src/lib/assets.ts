const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

/** Prepend basePath to public asset paths for static export (GitHub Pages). */
export const asset = (path: string) => `${BASE}${path}`;

/** Prepend basePath to internal hrefs used in plain <a> tags (not Next.js Link). */
export const route = (path: string) => `${BASE}${path}`;
