import React from 'react';
import { Box, Typography } from '@mui/material';
import { RALColor } from '../data/ralColors';

interface PanelConfigurationSummaryProps {
  panelDesign: any;
  icons: Array<{
    label: string;
    position: number;
    category?: string;
  }>;
  ralColors: RALColor[];
  ICON_COLOR_FILTERS: { [key: string]: string };
  backbox?: string;
  comments?: string;
}

const PanelConfigurationSummary: React.FC<PanelConfigurationSummaryProps> = ({
  panelDesign,
  icons,
  ralColors,
  ICON_COLOR_FILTERS,
  backbox,
  comments,
}) => {
  const selectedRALColor = ralColors.find(color => color.hex === panelDesign.backgroundColor);
  const iconColorName = Object.keys(ICON_COLOR_FILTERS).find(color => color === panelDesign.iconColor);

  return (
    <Box sx={{
      width: 400,
      background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
      borderRadius: 3,
      boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.08)',
      border: '1px solid rgba(255,255,255,0.8)',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Header */}
      <Box sx={{
        background: 'linear-gradient(135deg, #1a1f2c 0%, #2c3e50 100%)',
        color: '#ffffff',
        p: 2.5,
        textAlign: 'center',
        position: 'relative',
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
        },
      }}>
        <Typography variant="h6" sx={{
          fontWeight: 600,
          letterSpacing: '0.5px',
          fontSize: '18px',
          textShadow: '0 1px 2px rgba(0,0,0,0.3)',
        }}>
          Panel Configuration Summary
        </Typography>
      </Box>
      {/* Content */}
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* Icons Section */}
          <Box sx={{
            background: 'linear-gradient(145deg, #f8f9fa 0%, #ffffff 100%)',
            p: 2,
            borderRadius: 2,
            border: '1px solid #e9ecef',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}>
            <Typography variant="subtitle2" sx={{
              fontWeight: 700,
              mb: 1.5,
              color: '#1a1f2c',
              fontSize: '15px',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}>
              <Box sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#4CAF50',
                flexShrink: 0,
              }} />
              Selected Icons ({icons.filter(icon => icon.label && icon.label.trim() !== '').length})
            </Typography>
            {icons.filter(icon => icon.label && icon.label.trim() !== '').length > 0 ? (
              <Typography variant="body2" sx={{
                color: '#2c3e50',
                fontSize: '14px',
                fontWeight: 500,
                lineHeight: 1.4,
              }}>
                {icons
                  .filter(icon => icon.label && icon.label.trim() !== '')
                  .map((icon, index, filteredIcons) => (
                    <span key={icon.position}>
                      {icon.label}{index < filteredIcons.length - 1 ? ', ' : ''}
                    </span>
                  ))}
              </Typography>
            ) : (
              <Typography variant="body2" sx={{
                color: '#6c757d',
                fontStyle: 'italic',
                fontSize: '14px',
              }}>
                No icons selected
              </Typography>
            )}
          </Box>
          {/* Colors Section */}
          <Box sx={{
            background: 'linear-gradient(145deg, #f8f9fa 0%, #ffffff 100%)',
            p: 2,
            borderRadius: 2,
            border: '1px solid #e9ecef',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}>
            <Typography variant="subtitle2" sx={{
              fontWeight: 700,
              mb: 1.5,
              color: '#1a1f2c',
              fontSize: '15px',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}>
              <Box sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#FF6B35',
                flexShrink: 0,
              }} />
              Color Configuration
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {/* Panel Background */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{
                  width: 20,
                  height: 20,
                  borderRadius: 1.5,
                  background: panelDesign.backgroundColor || '#ffffff',
                  border: '2px solid #dee2e6',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }} />
                <Typography variant="body2" sx={{ color: '#2c3e50', fontSize: '14px', fontWeight: 500 }}>
                  Panel: {selectedRALColor ? `RAL ${selectedRALColor.code}` : 'Default'}
                </Typography>
              </Box>
              {/* Icon Color */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{
                  width: 20,
                  height: 20,
                  borderRadius: 1.5,
                  background: panelDesign.iconColor,
                  border: '2px solid #dee2e6',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }} />
                <Typography variant="body2" sx={{ color: '#2c3e50', fontSize: '14px', fontWeight: 500 }}>
                  Icons: {iconColorName || panelDesign.iconColor}
                </Typography>
              </Box>
              {/* Text Color */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{
                  width: 20,
                  height: 20,
                  borderRadius: 1.5,
                  background: panelDesign.textColor,
                  border: '2px solid #dee2e6',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }} />
                <Typography variant="body2" sx={{ color: '#2c3e50', fontSize: '14px', fontWeight: 500 }}>
                  Text: {panelDesign.textColor}
                </Typography>
              </Box>
            </Box>
          </Box>
          {/* Typography Section */}
          <Box sx={{
            background: 'linear-gradient(145deg, #f8f9fa 0%, #ffffff 100%)',
            p: 2,
            borderRadius: 2,
            border: '1px solid #e9ecef',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          }}>
            <Typography variant="subtitle2" sx={{
              fontWeight: 700,
              mb: 1.5,
              color: '#1a1f2c',
              fontSize: '15px',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}>
              <Box sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: '#9C27B0',
                flexShrink: 0,
              }} />
              Typography Settings
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography variant="body2" sx={{ color: '#2c3e50', fontSize: '14px', fontWeight: 500 }}>
                Font: {panelDesign.fonts || 'Default'}
              </Typography>
              <Typography variant="body2" sx={{ color: '#2c3e50', fontSize: '14px', fontWeight: 500 }}>
                Size: {panelDesign.fontSize || '12px'}
              </Typography>
            </Box>
          </Box>
          {/* Backbox and Comments fields (display only) */}
          {backbox && (
            <Box sx={{
              background: 'linear-gradient(145deg, #f8f9fa 0%, #ffffff 100%)',
              p: 2,
              borderRadius: 2,
              border: '1px solid #e9ecef',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              mt: 2,
            }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: '#1a1f2c', fontSize: '15px' }}>
                Backbox Details
              </Typography>
              <Typography variant="body2" sx={{ color: '#2c3e50', fontSize: '14px' }}>{backbox}</Typography>
            </Box>
          )}
          {comments && (
            <Box sx={{
              background: 'linear-gradient(145deg, #f8f9fa 0%, #ffffff 100%)',
              p: 2,
              borderRadius: 2,
              border: '1px solid #e9ecef',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              mt: 2,
            }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: '#1a1f2c', fontSize: '15px' }}>
                Additional Comments
              </Typography>
              <Typography variant="body2" sx={{ color: '#2c3e50', fontSize: '14px' }}>{comments}</Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default PanelConfigurationSummary; 