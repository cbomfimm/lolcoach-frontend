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

export function champIconUrlById(id: number, champMap: Map<number, string>): string {
  const name = champMap.get(id);
  if (!name) return '';
  return champIconUrl(name);
}

export function itemIconUrl(id: number): string | null {
  if (!id) return null;
  return `https://ddragon.leagueoflegends.com/cdn/${v()}/img/item/${id}.png`;
}

export function profileIconUrl(id: number): string {
  return `https://ddragon.leagueoflegends.com/cdn/${v()}/img/profileicon/${id}.png`;
}

export function spellIconUrlById(id: number, spellMap: Map<number, string>): string {
  const spellId = spellMap.get(id);
  if (!spellId) return '';
  return `https://ddragon.leagueoflegends.com/cdn/${v()}/img/spell/${spellId}.png`;
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

// ─── Champion ID → name map ────────────────────────────────────────────────

let cachedChampMap: Map<number, string> | null = null;

/** Returns a Map<championId, championKey> for use with champIconUrl / champion name display. */
export async function getChampionsMap(): Promise<Map<number, string>> {
  if (cachedChampMap) return cachedChampMap;
  try {
    const version = await getDDragonVersion();
    const res = await fetch(
      `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`
    );
    if (!res.ok) return new Map();
    const json = await res.json();
    const data: Record<string, { key: string; name: string }> = json.data;
    const map = new Map<number, string>();
    for (const champ of Object.values(data)) {
      map.set(parseInt(champ.key, 10), champ.name);
    }
    cachedChampMap = map;
    return map;
  } catch {
    return new Map();
  }
}

/** Returns champion name from numeric ID. Falls back to "#ID" string. */
export function getChampionName(id: number, champMap: Map<number, string>): string {
  return champMap.get(id) ?? `#${id}`;
}

// ─── Summoner spell ID → icon key map ─────────────────────────────────────

let cachedSpellMap: Map<number, string> | null = null;

/** Returns a Map<spellNumericId, spellKey> for icon URL construction. */
export async function getSpellsMap(): Promise<Map<number, string>> {
  if (cachedSpellMap) return cachedSpellMap;
  try {
    const version = await getDDragonVersion();
    const res = await fetch(
      `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/summoner.json`
    );
    if (!res.ok) return new Map();
    const json = await res.json();
    const data: Record<string, { key: string; id: string }> = json.data;
    const map = new Map<number, string>();
    for (const spell of Object.values(data)) {
      map.set(parseInt(spell.key, 10), spell.id);
    }
    cachedSpellMap = map;
    return map;
  } catch {
    return new Map();
  }
}

// ─── Rune/perk ID → icon URL map ──────────────────────────────────────────

export interface DDragonRune     { id: number; icon: string; name: string; shortDesc?: string }
export interface DDragonRuneSlot { runes: DDragonRune[] }
export interface DDragonRunePath { id: number; icon: string; name: string; slots: DDragonRuneSlot[] }

let cachedRuneMap:  Map<number, string>    | null = null;
let cachedRuneData: DDragonRunePath[]      | null = null;

/** Returns a Map<runeId, fullIconUrl> including both path icons and keystone icons. */
export async function getRunesMap(): Promise<Map<number, string>> {
  if (cachedRuneMap) return cachedRuneMap;
  const paths = await getRunesData();
  const map = new Map<number, string>();
  const base = `https://ddragon.leagueoflegends.com/cdn/img/`;
  for (const path of paths) {
    map.set(path.id, `${base}${path.icon}`);
    for (const slot of path.slots) {
      for (const rune of slot.runes) {
        map.set(rune.id, `${base}${rune.icon}`);
      }
    }
  }
  cachedRuneMap = map;
  return map;
}

/** Returns the full rune tree structure from ddragon (all paths, slots, runes). */
export async function getRunesData(): Promise<DDragonRunePath[]> {
  if (cachedRuneData) return cachedRuneData;
  try {
    const version = await getDDragonVersion();
    const res = await fetch(
      `https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/runesReforged.json`
    );
    if (!res.ok) return [];
    const paths: DDragonRunePath[] = await res.json();
    cachedRuneData = paths;
    return paths;
  } catch {
    return [];
  }
}
