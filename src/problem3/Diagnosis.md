# Problem 3: Messy React

Issues I found in the WalletPage component, how to fix them, and a refactored version at the end.

## Bugs

1. `lhsPriority` is not defined. The filter declares `balancePriority` but uses `lhsPriority`, so it crashes at runtime. Use `balancePriority`.

2. The filter is backwards. It keeps balances with `amount <= 0`. It should keep `amount > 0`.

3. `blockchain` is not in the `WalletBalance` interface, but the code uses `balance.blockchain`. Add it to the interface.

4. `formattedBalances` is created but never used. `rows` maps over `sortedBalances`, so `balance.formatted` is undefined. Render from the right array.

5. The sort comparator returns nothing when two priorities are equal. It should return `0`. Simplest fix is `rightPriority - leftPriority`.

## Performance

6. `getPriority` is defined inside the component, so it gets recreated on every render. Move it outside.

7. `useMemo` has `prices` in its dependency list but never uses it. Every price update re-runs the filter and sort for no reason. The dependency should be `[balances]` only.

8. `formattedBalances` and `rows` are recalculated on every render. Remove the unused one and memoize `rows`.

9. `getPriority` is called many times inside the sort comparator, and it runs a switch each time. A lookup object is faster and easier to read.

10. `WalletRow` is not memoized, so every row re-renders whenever the parent does. Wrap it in `React.memo`.

## Anti-patterns

11. `key={index}` is a problem here because the list is filtered and sorted, so the index changes. Use a stable key like `blockchain + currency`.

12. `blockchain: any` removes type safety. Use a union type or `string`.

13. `-99` and the priority numbers are magic numbers. Put them in a named constant and a lookup object.

14. `toFixed()` with no argument rounds to a whole number. That loses precision for crypto amounts. Pass the decimals, for example `toFixed(2)`.

15. `prices[balance.currency]` can be undefined, which gives `NaN`. Use `?? 0` as a fallback.

16. `FormattedWalletBalance` repeats the fields of `WalletBalance`. Use `extends`.

17. Small things: `children` is destructured but never used, `React.FC` with an explicit `props: Props` is redundant, `Props` is empty, and the indentation mixes tabs and spaces.

## Refactored code

```tsx
type Blockchain = 'Osmosis' | 'Ethereum' | 'Arbitrum' | 'Zilliqa' | 'Neo';

interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: Blockchain | string;
}

interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
  usdValue: number;
}

interface Props extends BoxProps {}

// REFACTORED HERE
const DEFAULT_PRIORITY = -99;

const BLOCKCHAIN_PRIORITY: Record<string, number> = {
  Osmosis: 100,
  Ethereum: 50,
  Arbitrum: 30,
  Zilliqa: 20,
  Neo: 20,
};

// REFACTORED HERE
const getPriority = (blockchain: string): number =>
  BLOCKCHAIN_PRIORITY[blockchain] ?? DEFAULT_PRIORITY;

const WalletPage: React.FC<Props> = ({ children, ...rest }) => {
  const balances = useWalletBalances();
  const prices = usePrices();

  // REFACTORED HERE
  // Depends only on balances: prices don't affect filtering or sorting
  const sortedBalances = useMemo(
    () =>
      balances
        .filter((b) => getPriority(b.blockchain) > DEFAULT_PRIORITY && b.amount > 0)
        .sort((a, b) => getPriority(b.blockchain) - getPriority(a.blockchain)),
    [balances]
  );

  // REFACTORED HERE
  // Depends on prices, so it recomputes only when prices or the sorted list change
  const rows = useMemo(
    () =>
      sortedBalances.map((balance) => {
        const usdValue = (prices[balance.currency] ?? 0) * balance.amount;
        return (
          <WalletRow
            className={classes.row}
            key={`${balance.blockchain}-${balance.currency}`}
            amount={balance.amount}
            usdValue={usdValue}
            formattedAmount={balance.amount.toFixed(2)}
          />
        );
      }),
    [sortedBalances, prices]
  );

  return <div {...rest}>{rows}</div>;
};

export default WalletPage;
```

## Notes

- I assumed the filter should keep known blockchains with a positive amount. The original code doesn't make this clear.
