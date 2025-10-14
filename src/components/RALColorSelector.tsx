import React, { useState } from 'react';
import { ralColors, RALColor } from '../data/ralColors';

interface RALColorSelectorProps {
  selectedColor: string;
  onColorSelect: (hex: string) => void;
}

const RALColorSelector: React.FC<RALColorSelectorProps> = ({ selectedColor, onColorSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredColors = ralColors.filter((color: RALColor) => 
    color.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    color.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{
      marginBottom: '28px',
      background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
      padding: '20px',
      borderRadius: '10px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)',
      border: '1px solid #e9ecef',
    }}>
      <div style={{
        fontWeight: '600',
        marginBottom: '16px',
        color: '#1a1f2c',
        fontSize: '15px',
        letterSpacing: '0.3px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        <div style={{
          width: '4px',
          height: '16px',
          background: 'linear-gradient(180deg, #0056b3 0%, #007bff 100%)',
          borderRadius: '2px',
        }} />
        Background Color (RAL)
      </div>
      
      {/* RAL Color Search */}
      <div style={{ marginBottom: '12px' }}>
        <input
          type="text"
          placeholder="Search RAL colors by code or name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 12px',
            border: '1px solid #dee2e6',
            borderRadius: '6px',
            fontSize: '14px',
            fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif',
            background: '#ffffff',
            boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
            outline: 'none',
            transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#0056b3';
            e.target.style.boxShadow = '0 2px 8px rgba(0, 86, 179, 0.15)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#dee2e6';
            e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.04)';
          }}
        />
      </div>
      
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
          gap: '10px',
          maxHeight: '200px',
          overflowY: 'auto',
          background: 'linear-gradient(145deg, #f8f9fa 0%, #ffffff 100%)',
          borderRadius: '8px',
          padding: '16px',
          border: '1px solid #dee2e6',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.04)',
        }}
      >
        {filteredColors.map((color: RALColor) => (
          <button
            key={color.code}
            type="button"
            onClick={() => onColorSelect(color.hex)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              border: selectedColor === color.hex ? '2px solid #0056b3' : '1px solid #dee2e6',
              borderRadius: '8px',
              background: selectedColor === color.hex ? 'linear-gradient(145deg, #e3f2fd 0%, #f0f8ff 100%)' : 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
              cursor: 'pointer',
              padding: '8px 6px',
              outline: 'none',
              boxShadow: selectedColor === color.hex ? '0 0 0 3px rgba(0, 86, 179, 0.15), 0 2px 8px rgba(0,0,0,0.1)' : '0 2px 6px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8)',
              transition: 'all 0.2s ease',
              transform: selectedColor === color.hex ? 'translateY(-1px)' : 'translateY(0)',
            }}
          >
            <span
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                background: color.hex,
                border: '2px solid #ffffff',
                marginBottom: '6px',
                display: 'block',
                boxShadow: '0 2px 4px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.3)',
              }}
            />
            <span style={{ fontSize: '11px', fontWeight: '600', color: '#495057' }}>{`RAL ${color.code}`}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default RALColorSelector;
