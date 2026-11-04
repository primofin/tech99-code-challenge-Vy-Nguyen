export interface PriceItem {
  currency: string;
  date: string;
  price: number;
}

// currency -> latest price in USD
export type PriceMap = Record<string, number>;
