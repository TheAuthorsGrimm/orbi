import { useId } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
}

interface NativeSelectFieldProps {
  label?: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

/**
 * Drop-in replacement for @figma/astraui's <SelectField>.
 *
 * Uses a real HTML <select> so the browser handles focus and keyboard
 * itself — spacebar typed in a sibling <input> does NOT open this
 * dropdown the way Astra UI's version did.
 *
 * Visual style is tuned to match the rest of the dark theme.
 */
export function NativeSelectField({
  label,
  value,
  options,
  onChange,
  disabled = false,
  placeholder,
}: NativeSelectFieldProps) {
  const id = useId();

  return (
    <div className="flex flex-col gap-sm w-full">
      {label && (
        <label
          htmlFor={id}
          className="text-label-sm text-text-secondary"
          style={{ fontSize: 'clamp(0.8rem, 1.2vw, 0.9rem)' }}
        >
          {label}
        </label>
      )}

      <div className="relative w-full">
        <select
          id={id}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-corner-md text-text-primary outline-none transition disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1.5px solid rgba(255,255,255,0.12)',
            padding: '0.65rem 2.25rem 0.65rem 0.85rem',
            fontFamily: 'Atkinson Hyperlegible, sans-serif',
            fontSize: 'clamp(0.9rem, 1.3vw, 1rem)',
            lineHeight: 1.4,
            cursor: disabled ? 'not-allowed' : 'pointer',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = 'rgba(82,80,243,0.6)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
          }}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} style={{ background: '#0a0a1a', color: '#fff' }}>
              {opt.label}
            </option>
          ))}
        </select>

        <ChevronDown
          size={16}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary"
        />
      </div>
    </div>
  );
}
