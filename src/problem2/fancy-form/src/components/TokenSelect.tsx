import { useEffect, useState } from 'react';
import { iconUrl } from '../api/prices';

interface Props {
  id: string;
  label: string;
  value: string;
  options: string[];
  onChange: (currency: string) => void;
}

export default function TokenSelect({ id, label, value, options, onChange }: Props) {
  const [iconFailed, setIconFailed] = useState(false);
  useEffect(() => setIconFailed(false), [value]);

  return (
    <div className="token-select">
      {value && !iconFailed ? (
        <img className="token-icon" src={iconUrl(value)} alt="" onError={() => setIconFailed(true)} />
      ) : value ? (
        <span className="token-fallback">{value.slice(0, 1)}</span>
      ) : null}
      <select id={id} aria-label={label} value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((currency) => <option key={currency} value={currency}>{currency}</option>)}
      </select>
      <span className="chevron" aria-hidden="true">⌄</span>
    </div>
  );
}
