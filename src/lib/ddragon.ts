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
