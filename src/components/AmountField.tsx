import { useState, type ChangeEvent } from 'react';

interface Props {
  id: string;
  label: string;
  hint: string;
  suggestedLabel: string;
  otherLabel: string;
  suggested: number[];
  name?: string;
  showProgress?: boolean;
  progressLabel?: string;
  progressCurrent?: number;
  progressGoal?: number;
}

export default function AmountField({
  id,
  label,
  hint,
  suggestedLabel,
  otherLabel,
  suggested,
  name = 'amount',
  showProgress = false,
  progressLabel = 'Raised',
  progressCurrent = 0,
  progressGoal = 0,
}: Props) {
  const [amount, setAmount] = useState(0);
  const [custom, setCustom] = useState('');

  function selectChip(n: number) {
    setAmount(n);
    setCustom(String(n));
  }

  function onCustom(e: ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    if (raw === '') {
      setCustom('');
      setAmount(0);
      return;
    }
    const n = Math.max(0, Number(raw));
    if (Number.isFinite(n)) {
      setCustom(String(n));
      setAmount(n);
    }
  }

  const pct =
    showProgress && progressGoal > 0
      ? Math.min(100, Math.round((progressCurrent / progressGoal) * 100))
      : 0;

  return (
    <div className="form-row">
      <label htmlFor={id}>{label}</label>
      <p className="hint">{hint}</p>
      <p className="hint" style={{ marginBottom: '0.35rem' }}>
        {suggestedLabel}
      </p>
      <div className="chip-row" role="group" aria-label={suggestedLabel}>
        {suggested.map((n) => (
          <button
            key={n}
            type="button"
            className="chip"
            aria-pressed={amount === n && custom === String(n)}
            onClick={() => selectChip(n)}
          >
            ${n}
          </button>
        ))}
      </div>
      <label htmlFor={`${id}-custom`} className="hint">
        {otherLabel}
      </label>
      <input
        id={`${id}-custom`}
        type="number"
        min={0}
        step="1"
        inputMode="decimal"
        value={custom}
        onChange={onCustom}
        placeholder="0"
      />
      <input type="hidden" name={name} value={amount} />
      {showProgress && progressGoal > 0 && (
        <div style={{ marginTop: '0.75rem' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.95rem',
              marginBottom: '0.35rem',
            }}
          >
            <span>{progressLabel}</span>
            <span>
              ${progressCurrent} / ${progressGoal} ({pct}%)
            </span>
          </div>
          <div
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
            style={{
              height: '0.5rem',
              background: 'var(--stone-warm)',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${pct}%`,
                height: '100%',
                background: 'var(--gold)',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
