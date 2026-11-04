import type { PriceItem, PriceMap } from '../types';

const PRICES_URL = 'https://interview.switcheo.com/prices.json';

export const iconUrl = (currency: string): string =>
  `https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${currency}.svg`;

// the api has several entries per currency, keep the newest valid one
export function pickLatestPrices(list: PriceItem[]): PriceMap {
  const latest: Record<string, { price: number; time: number }> = {};

  for (const item of list) {
    if (typeof item.price !== 'number' || item.price <= 0) continue;
    const time = new Date(item.date).getTime();
    const current = latest[item.currency];
    if (!current || time > current.time) {
      latest[item.currency] = { price: item.price, time };
    }
  }

  const result: PriceMap = {};
  for (const currency of Object.keys(latest)) {
    result[currency] = latest[currency].price;
  }
  return result;
}

export async function fetchPrices(signal?: AbortSignal): Promise<PriceMap> {
  const res = await fetch(PRICES_URL, { signal });
  if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
  const data: PriceItem[] = await res.json();
  return pickLatestPrices(data);
}
