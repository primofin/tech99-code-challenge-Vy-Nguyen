import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { usePrices } from '../hooks/usePrices';
import { formatNumber, sanitizeAmount } from '../utils/format';
import TokenSelect from './TokenSelect';

export default function SwapForm() {
  const { prices, loading, error } = usePrices();
  const [fromChoice, setFromChoice] = useState('');
  const [toChoice, setToChoice] = useState('');
  const [amount, setAmount] = useState('');
  const [amountTouched, setAmountTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [flipping, setFlipping] = useState(false);

  const currencies = useMemo(() => Object.keys(prices).sort(), [prices]);
  const from = fromChoice || (currencies.includes('ETH') ? 'ETH' : currencies[0] ?? '');
  const to = toChoice || (currencies.includes('USDC') ? 'USDC' : currencies[1] ?? '');
  const amountNumber = parseFloat(amount);
  const hasAmount = amount !== '';
  const amountInvalid = hasAmount && (!Number.isFinite(amountNumber) || !(amountNumber > 0));
  const amountRequired = amountTouched && !hasAmount;
  const amountError = amountInvalid ? 'Enter an amount greater than 0.' : amountRequired ? 'Enter an amount to swap.' : '';
  const sameToken = from !== '' && from === to;
  const rate = prices[from] && prices[to] ? prices[from] / prices[to] : NaN;
  const output = amountNumber > 0 && Number.isFinite(rate) ? amountNumber * rate : NaN;
  const amountTooLarge = hasAmount && Number.isFinite(rate) && Number.isFinite(amountNumber) && !Number.isFinite(output);
  const displayedAmountError = amountTooLarge && !amountError ? 'Amount is too large.' : amountError;
  const canSubmit = !loading && !error && !submitting && hasAmount && !amountInvalid && !amountTooLarge && !sameToken && Number.isFinite(output);

  const handleFlip = () => {
    if (flipping) return;

    setFlipping(true);
    setFromChoice(to);
    setToChoice(from);
    if (Number.isFinite(output) && output > 0) {
      setAmount(String(output));
    }
    setAmountTouched(false);
    setMessage('');
    window.setTimeout(() => setFlipping(false), 320);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setAmountTouched(true);
    if (!canSubmit) return;
    const summary = `${amount} ${from} → ${formatNumber(output)} ${to}`;
    setSubmitting(true);
    setMessage('');
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setSubmitting(false);
    setAmount('');
    setAmountTouched(false);
    setMessage(`Swapped ${summary}`);
  };

  return (
    <main className="page">
      <div className="orb orb-one" />
      <div className="orb orb-two" />
      <form className="swap-card" onSubmit={handleSubmit} noValidate>
        <header className="card-header">
          <div>
            <span className="eyebrow">Exchange</span>
            <h1>Swap tokens</h1>
          </div>
          <button className="settings-button" type="button" aria-label="Swap settings">•••</button>
        </header>

        <section className={`token-panel${displayedAmountError ? ' invalid' : ''}`}>
          <label htmlFor="input-amount">You pay</label>
          <div className="token-row">
            <input
              id="input-amount"
              className="amount-input"
              inputMode="decimal"
              placeholder="0.0"
              autoComplete="off"
              required
              aria-invalid={Boolean(displayedAmountError)}
              aria-describedby="amount-error"
              value={amount}
              onBlur={() => setAmountTouched(true)}
              onChange={(e) => { setAmount(sanitizeAmount(e.target.value)); setMessage(''); }}
            />
            <TokenSelect id="from-token" label="Token to send" value={from} options={currencies} onChange={(value) => { setFromChoice(value); setMessage(''); }} />
          </div>
          <p className="token-meta">
            <span>Balance</span>
            <span id="amount-error" className="error" aria-live="polite">{displayedAmountError}</span>
          </p>
        </section>

        <div className="flip-wrap">
          <button type="button" className={`flip-button${flipping ? ' flipping' : ''}`} aria-label="Switch tokens" onClick={handleFlip}>⇅</button>
        </div>

        <section className={`token-panel${sameToken ? ' invalid' : ''}`}>
          <label htmlFor="output-amount">You receive</label>
          <div className="token-row">
            <input
              id="output-amount"
              className="amount-input output"
              placeholder="0.0"
              readOnly
              aria-invalid={sameToken}
              aria-describedby="token-error"
              value={Number.isFinite(output) ? formatNumber(output) : ''}
            />
            <TokenSelect id="to-token" label="Token to receive" value={to} options={currencies} onChange={(value) => { setToChoice(value); setMessage(''); }} />
          </div>
          <p className="token-meta">
            <span>Estimated</span>
            <span id="token-error" className="error" aria-live="polite">{sameToken ? 'Pick two different tokens.' : ''}</span>
          </p>
        </section>

        {Number.isFinite(rate) && !sameToken && (
          <div className="rate-row">
            <span>1 {from}</span>
            <span className="rate-arrow">→</span>
            <strong>{formatNumber(rate)} {to}</strong>
          </div>
        )}

        <button type="submit" className="swap-button" disabled={!canSubmit}>
          {submitting && <span className="spinner" />}
          {submitting ? 'Swapping' : 'Swap tokens'}
        </button>

        <p className={`status${error ? ' fail' : message ? ' ok' : ''}`} role="status">
          {error ?? (loading ? 'Loading live prices...' : message)}
        </p>
      </form>
    </main>
  );
}
