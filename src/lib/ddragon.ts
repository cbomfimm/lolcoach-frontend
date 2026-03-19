const FALLBACK = '14.24.1';
let cached: string | null = null;

export async function getDDragonVersion(): Promise<string> {
  if (cached) return cached;
  try {
    const res = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
    if (!res.ok) return FALLBACK;
    const versions: string[] = await res.json();
    cached = versions[0] ?? FALLBACK;
    return cached;
  } catch {
    return FALLBACK;
  }
}

function v() { return cached ?? FALLBACK; }

export function champIconUrl(name: string): string {
  const normalized = name.replace(/\s*&.*/, '').replace(/[\s'\.]/g, '');
  return `https://ddragon.leagueoflegends.com/cdn/${v()}/img/champion/${normalized}.png`;
}

export function itemIconUrl(id: number): string | null {
  if (!id) return null;
  return `https://ddragon.leagueoflegends.com/cdn/${v()}/img/item/${id}.png`;
}

export function profileIconUrl(id: number): string {
  return `https://ddragon.leagueoflegends.com/cdn/${v()}/img/profileicon/${id}.png`;
}

export function ddragonBase(version: string) {
  return `https://ddragon.leagueoflegends.com/cdn/${version}`;
}

// ─── Item data ────────────────────────────────────────────────────────────────

export interface DDragonItemInfo {
  name: string;
  plaintext: string;
  description: string;
  gold: { base: number; total: number; sell: number; purchasable: boolean };
  stats: Record<string, number>;
  from?: string[];    // component item IDs
  into?: string[];    // items this builds into
}

/** Strips DDragon HTML tags, keeping readable text. */
export function stripItemHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<li>/gi, '• ')
    .replace(/<[^>]+>/g, '')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

let cachedItems: Record<string, DDragonItemInfo> | null = null;

export async function getItemsData(): Promise<Record<string, DDragonItemInfo>> {
  if (cachedItems) return cachedItems;
  try {
    const version = await getDDragonVersion();
    const res = await fetch(
      `https://ddragon.leagueoflegends.com/cdn/${version}/data/pt_BR/item.json`
    );
    if (!res.ok) return {};
    const json = await res.json();
    cachedItems = json.data as Record<string, DDragonItemInfo>;
    return cachedItems;
  } catch {
    return {};
  }
}
