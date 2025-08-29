import React from 'react';

export type PanelMode = 'custom' | 'icons_text' | 'text_only';

export interface PanelModeSelectorProps {
  value: PanelMode;
  onChange: (mode: PanelMode) => void;
}

const pill: React.CSSProperties = {
  padding: '8px 12px',
  borderRadius: '16px',
  border: '1px solid #d0d7de',
  background: '#fff',
  color: '#24292f',
  cursor: 'pointer',
  transition: 'background 0.15s ease, border-color 0.15s ease',
  fontSize: 13,
  lineHeight: 1.2
};

const active: React.CSSProperties = {
  border: '1px solid #0969da',
  background: '#e7f3ff',
  color: '#0a3069'
};

const PanelModeSelector: React.FC<PanelModeSelectorProps> = ({ value, onChange }) => {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <span style={{ fontSize: 13, color: '#57606a' }}>Mode:</span>
      <button
        type="button"
        onClick={() => onChange('icons_text')}
        style={{ ...pill, ...(value === 'icons_text' ? active : {}) }}
      >
        Icons & text
      </button>
      <button
        type="button"
        onClick={() => onChange('text_only')}
        style={{ ...pill, ...(value === 'text_only' ? active : {}) }}
      >
        Text only
      </button>
      <button
        type="button"
        onClick={() => onChange('custom')}
        style={{ ...pill, ...(value === 'custom' ? active : {}) }}
      >
        Custom panel
      </button>
    </div>
  );
};

export default PanelModeSelector;


