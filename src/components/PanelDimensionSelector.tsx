import React from 'react';

interface DimensionOption {
  key: string;
  label: string;
  sublabel: string;
}

export interface PanelDimensionSelectorProps {
  options: DimensionOption[];
  value: string;
  onChange: (key: string) => void;
  inlineLabel?: string; // e.g., "Size:" placed after first button
}

const buttonBase: React.CSSProperties = {
  padding: '8px 12px',
  borderRadius: '16px',
  border: '1px solid #d0d7de',
  background: '#fff',
  color: '#24292f',
  cursor: 'pointer',
  transition: 'background 0.15s ease, border-color 0.15s ease',
  minWidth: 'auto',
  textAlign: 'center',
  fontSize: 13,
  lineHeight: 1.2
};

const activeButton: React.CSSProperties = {
  border: '1px solid #0969da',
  background: '#e7f3ff',
  color: '#0a3069'
};

const PanelDimensionSelector: React.FC<PanelDimensionSelectorProps> = ({ options, value, onChange, inlineLabel }) => {
  return (
    <div style={{
      margin: '0 auto 10px auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      flexWrap: 'wrap'
    }}>
      {options.map((opt, idx) => (
        <React.Fragment key={opt.key}>
          {inlineLabel && idx === 0 && (
            <span style={{ fontSize: 13, color: '#57606a' }}>{inlineLabel}</span>
          )}
          <button
            onClick={() => onChange(opt.key)}
            style={{
              ...buttonBase,
              ...(value === opt.key ? activeButton : {}),
            }}
            aria-pressed={value === opt.key}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span>{opt.label}</span>
              {opt.sublabel && (
                <span style={{ fontSize: 11, color: '#6e7781', marginTop: 2 }}>{opt.sublabel}</span>
              )}
            </div>
          </button>
        </React.Fragment>
      ))}
    </div>
  );
};

export default PanelDimensionSelector;


