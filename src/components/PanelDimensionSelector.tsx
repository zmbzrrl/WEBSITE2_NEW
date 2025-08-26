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
}

const buttonBase: React.CSSProperties = {
  padding: '10px 16px',
  borderRadius: '8px',
  border: '1px solid #dee2e6',
  background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
  color: '#495057',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  minWidth: '160px',
  textAlign: 'left'
};

const activeButton: React.CSSProperties = {
  border: '2px solid #0056b3',
  background: 'linear-gradient(145deg, #e3f2fd 0%, #f0f8ff 100%)',
  color: '#1a1f2c',
  boxShadow: '0 0 0 3px rgba(0, 86, 179, 0.12), 0 2px 8px rgba(0,0,0,0.1)'
};

const PanelDimensionSelector: React.FC<PanelDimensionSelectorProps> = ({ options, value, onChange }) => {
  return (
    <div style={{
      margin: '0 auto 16px auto',
      maxWidth: 900,
      background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
      padding: '16px',
      borderRadius: '10px',
      border: '1px solid #e9ecef',
      boxShadow: '0 2px 12px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)'
    }}>
      <div style={{
        fontWeight: 600,
        marginBottom: 12,
        color: '#1a1f2c',
        fontSize: 15,
        letterSpacing: '0.3px',
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }}>
        <div style={{
          width: 4,
          height: 16,
          background: 'linear-gradient(180deg, #0056b3 0%, #007bff 100%)',
          borderRadius: 2
        }} />
        Select Panel Dimensions
      </div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        {options.map(opt => (
          <button
            key={opt.key}
            onClick={() => onChange(opt.key)}
            style={{
              ...buttonBase,
              ...(value === opt.key ? activeButton : {}),
            }}
          >
            <div style={{ fontWeight: 700, fontSize: 14 }}>{opt.label}</div>
            <div style={{ fontSize: 12, color: '#6c757d' }}>{opt.sublabel}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default PanelDimensionSelector;


