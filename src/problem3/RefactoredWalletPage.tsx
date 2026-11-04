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