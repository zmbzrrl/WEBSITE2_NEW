import React, { useState, useRef, useCallback, useContext } from "react";
import { useCart } from "../contexts/CartContext";
import { useNavigate } from "react-router-dom";
import CartButton from "../components/CartButton";
import { Add, Save, Upload } from '@mui/icons-material';
import PanelPreview from "../components/PanelPreview";
import { ralColors } from "../data/ralColors";
import { ProjectContext } from '../App';

const THEME = {
  primary: '#1b92d1',
  primaryHover: 'rgba(27,146,209,0.9)',
  secondary: '#666666',
  background: '#f5f5f5',
  card: '#fff',
  textPrimary: '#333333',
  textSecondary: '#666666',
  borderRadius: 14,
  buttonRadius: 8,
  fontFamily: '"Myriad Hebrew", "Monsal Gothic", Arial, sans-serif',
  shadow: '0 2px 4px rgba(0,0,0,0.05)',
  cardShadow: '0 4px 16px rgba(0,0,0,0.07)',
};

interface PlacedPanel {
  id: string;
  panelIndex: number;
  x: number;
  y: number;
  roomType: string;
  panelData: {
    type: string;
    icons: Array<{
      iconId: string | null;
      label: string;
      position: number;
      text: string;
      src?: string;
      category?: string;
    }>;
    quantity: number;
    panelDesign?: {
      backgroundColor: string;
      iconColor: string;
      textColor: string;
      fontSize: string;
      fonts?: string;
      backbox?: string;
      extraComments?: string;
    };
  };
}

interface RoomType {
  id: string;
  name: string;
  color: string;
}

const Layouts: React.FC = () => {
  const navigate = useNavigate();
  const { projPanels } = useCart();
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([
    { id: '1', name: 'Bedroom', color: '#FF6B6B' },
    { id: '2', name: 'Bathroom', color: '#4ECDC4' },
    { id: '3', name: 'Kitchen', color: '#45B7D1' },
    { id: '4', name: 'Living Room', color: '#96CEB4' },
    { id: '5', name: 'Dining Room', color: '#FFEAA7' },
  ]);
  const [selectedRoomType, setSelectedRoomType] = useState<string>('1');
  const [selectedPanelIndex, setSelectedPanelIndex] = useState<number | null>(null);
  const [placedPanels, setPlacedPanels] = useState<PlacedPanel[]>([]);
  const [isPlacingPanel, setIsPlacingPanel] = useState(false);
  const [showPanelSelector, setShowPanelSelector] = useState(false);
  const [newRoomTypeName, setNewRoomTypeName] = useState('');
  const [showRoomTypeInput, setShowRoomTypeInput] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const { projectName, projectCode } = useContext(ProjectContext);

  // Handle PDF upload
  const handlePdfUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setPdfFile(file);
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
    }
  };

  // Add new room type
  const addRoomType = () => {
    if (newRoomTypeName.trim()) {
      const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];
      const newRoomType: RoomType = {
        id: Date.now().toString(),
        name: newRoomTypeName.trim(),
        color: colors[Math.floor(Math.random() * colors.length)]
      };
      setRoomTypes([...roomTypes, newRoomType]);
      setNewRoomTypeName('');
      setShowRoomTypeInput(false);
    }
  };

  // Handle canvas click to place panel
  const handleCanvasClick = useCallback((event: React.MouseEvent) => {
    if (!isPlacingPanel || selectedPanelIndex === null || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const panelData = projPanels[selectedPanelIndex];
    if (panelData) {
      const newPlacedPanel: PlacedPanel = {
        id: Date.now().toString(),
        panelIndex: selectedPanelIndex,
        x,
        y,
        roomType: selectedRoomType,
        panelData
      };
      setPlacedPanels([...placedPanels, newPlacedPanel]);
    }

    setIsPlacingPanel(false);
    setSelectedPanelIndex(null);
  }, [isPlacingPanel, selectedPanelIndex, selectedRoomType, placedPanels, projPanels]);

  // Remove placed panel
  const removePlacedPanel = (panelId: string) => {
    setPlacedPanels(placedPanels.filter(panel => panel.id !== panelId));
  };

  // Start placing panel
  const startPlacingPanel = (panelIndex: number) => {
    setSelectedPanelIndex(panelIndex);
    setIsPlacingPanel(true);
    setShowPanelSelector(false);
  };

  // Get room type color
  const getRoomTypeColor = (roomTypeId: string) => {
    const roomType = roomTypes.find(rt => rt.id === roomTypeId);
    return roomType?.color || '#666666';
  };

  // Get room type name
  const getRoomTypeName = (roomTypeId: string) => {
    const roomType = roomTypes.find(rt => rt.id === roomTypeId);
    return roomType?.name || 'Unknown';
  };

  // Get panel type label
  const getPanelTypeLabel = (type: string) => {
    switch (type) {
      case "SP": return "SP Panel";
      case "TAG": return "TAG Panel";
      case "DPH": return "DPH Panel";
      case "DPV": return "DPV Panel";
      case "X2V": return "X2V Panel";
      case "X2H": return "X2H Panel";
      case "X1H": return "X1H Panel";
      case "X1V": return "X1V Panel";
      case "IDPG": return "IDPG Panel";
      default: return "Panel";
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: THEME.background,
      padding: '20px',
      fontFamily: THEME.fontFamily,
    }}>
      {/* Project Name at top center */}
      {(projectName || projectCode) && (
        <div style={{
          position: 'absolute',
          top: 20,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          pointerEvents: 'none',
          zIndex: 10
        }}>
          <span style={{
            fontSize: 14,
            color: '#ffffff',
            fontWeight: 400,
            letterSpacing: 0.5,
            fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif',
            opacity: 0.8,
          }}>
            {projectName}{projectCode && ` - ${projectCode}`}
          </span>
        </div>
      )}
      {/* Cart Button */}
      <div style={{
        position: 'absolute',
        top: 20,
        right: 30,
        zIndex: 1000
      }}>
        <CartButton />
      </div>
      
      <div style={{
        maxWidth: 1400,
        margin: '0 auto',
        padding: '48px 16px 32px 16px',
        borderRadius: THEME.borderRadius,
        background: THEME.card,
        boxShadow: THEME.shadow,
        marginTop: 48,
        marginBottom: 48,
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 style={{
            fontWeight: 700,
            fontSize: 32,
            color: THEME.textPrimary,
            letterSpacing: '1px',
            marginBottom: 8,
            textShadow: '0 1px 2px rgba(0,0,0,0.08)'
          }}>Room Layout Designer</h1>
          <div style={{
            width: 120,
            height: 5,
            margin: '0 auto',
            borderRadius: 3,
            background: THEME.primary,
            marginBottom: 8
          }} />
        </div>

        {/* Top Controls */}
        <div style={{
          display: 'flex',
          gap: 20,
          marginBottom: 30,
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {/* PDF Upload */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10
          }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 20px',
              background: THEME.primary,
              color: '#fff',
              borderRadius: THEME.buttonRadius,
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 600,
              transition: 'background 0.2s'
            }}>
              <Upload fontSize="small" />
              Upload Room Plan
              <input
                type="file"
                accept=".pdf"
                onChange={handlePdfUpload}
                style={{ display: 'none' }}
              />
            </label>
            {pdfFile && (
              <span style={{ fontSize: 14, color: THEME.textSecondary }}>
                {pdfFile.name}
              </span>
            )}
          </div>

          {/* Room Type Selector */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10
          }}>
            <span style={{ fontSize: 14, color: THEME.textSecondary }}>Room Type:</span>
            <select
              value={selectedRoomType}
              onChange={(e) => setSelectedRoomType(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1px solid #e0e0e0',
                borderRadius: 6,
                fontSize: 14,
                background: '#fff',
                color: THEME.textPrimary,
                minWidth: 120
              }}
            >
              {roomTypes.map(roomType => (
                <option key={roomType.id} value={roomType.id}>
                  {roomType.name}
                </option>
              ))}
            </select>
            <button
              onClick={() => setShowRoomTypeInput(true)}
              style={{
                padding: '8px 12px',
                background: THEME.secondary,
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                fontSize: 14,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              <Add fontSize="small" />
              Add Type
            </button>
          </div>

          {/* Panel Selector Button */}
          <button
            onClick={() => setShowPanelSelector(!showPanelSelector)}
            style={{
              padding: '10px 20px',
              background: isPlacingPanel ? '#ff6b6b' : THEME.primary,
              color: '#fff',
              border: 'none',
              borderRadius: THEME.buttonRadius,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
          >
            {isPlacingPanel ? 'Cancel Placement' : 'Select Panel'}
          </button>
        </div>

        {/* Add Room Type Input */}
        {showRoomTypeInput && (
          <div style={{
            display: 'flex',
            gap: 10,
            marginBottom: 20,
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <input
              type="text"
              value={newRoomTypeName}
              onChange={(e) => setNewRoomTypeName(e.target.value)}
              placeholder="Enter room type name..."
              style={{
                padding: '8px 12px',
                border: '1px solid #e0e0e0',
                borderRadius: 6,
                fontSize: 14,
                minWidth: 200
              }}
              onKeyPress={(e) => e.key === 'Enter' && addRoomType()}
            />
            <button
              onClick={addRoomType}
              style={{
                padding: '8px 16px',
                background: THEME.primary,
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                fontSize: 14,
                cursor: 'pointer'
              }}
            >
              Add
            </button>
            <button
              onClick={() => {
                setShowRoomTypeInput(false);
                setNewRoomTypeName('');
              }}
              style={{
                padding: '8px 16px',
                background: THEME.secondary,
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                fontSize: 14,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        )}

        {/* Main Content */}
        <div style={{ display: 'flex', gap: 20, height: '600px' }}>
          {/* Panel Selector */}
          {showPanelSelector && (
            <div style={{
              width: 350,
              background: '#f8f9fa',
              borderRadius: THEME.borderRadius,
              padding: 20,
              border: '1px solid #e0e0e0',
              overflowY: 'auto',
              maxHeight: '100%'
            }}>
              <h3 style={{
                marginBottom: 20,
                color: THEME.textPrimary,
                fontSize: 18,
                fontWeight: 600
              }}>
                Project Panels
              </h3>
              
              {projPanels.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '40px 20px',
                  color: THEME.textSecondary
                }}>
                  <p>No panels in your project yet.</p>
                  <button
                    onClick={() => navigate("/cart")}
                    style={{
                      marginTop: 10,
                      padding: '8px 16px',
                      background: THEME.primary,
                      color: '#fff',
                      border: 'none',
                      borderRadius: 6,
                      fontSize: 14,
                      cursor: 'pointer'
                    }}
                  >
                    Go to Panels
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
                  {projPanels.map((panel, index) => (
                    <div
                      key={index}
                      onClick={() => startPlacingPanel(index)}
                      style={{
                        border: '2px solid #e0e0e0',
                        borderRadius: 8,
                        padding: 15,
                        cursor: 'pointer',
                        background: '#fff',
                        transition: 'all 0.2s',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 10
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = THEME.primary;
                        e.currentTarget.style.transform = 'scale(1.02)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#e0e0e0';
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        marginBottom: 5
                      }}>
                        <div style={{
                          background: THEME.primary,
                          color: '#fff',
                          borderRadius: 6,
                          fontWeight: 700,
                          fontSize: 14,
                          minWidth: 24,
                          height: 24,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          {index + 1}
                        </div>
                        <span style={{
                          fontSize: 16,
                          fontWeight: 600,
                          color: THEME.textPrimary
                        }}>
                          {getPanelTypeLabel(panel.type)}
                        </span>
                      </div>
                      
                      <div style={{
                        transform: 'scale(0.8)',
                        transformOrigin: 'top left',
                        marginLeft: -10
                      }}>
                        <PanelPreview
                          icons={panel.icons.map(icon => ({
                            ...icon,
                            src: icon.src || '',
                            category: icon.category || ''
                          }))}
                          panelDesign={panel.panelDesign || { backgroundColor: '', iconColor: '#000', textColor: '#000', fontSize: '12px' }}
                          type={panel.type}
                        />
                      </div>
                      
                      <div style={{
                        fontSize: 12,
                        color: THEME.textSecondary,
                        textAlign: 'center'
                      }}>
                        Click to place on room plan
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Canvas Area */}
          <div style={{ flex: 1, position: 'relative' }}>
            {!pdfUrl ? (
              <div style={{
                width: '100%',
                height: '100%',
                border: '2px dashed #e0e0e0',
                borderRadius: THEME.borderRadius,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#f8f9fa',
                color: THEME.textSecondary,
                fontSize: 16
              }}>
                Upload a PDF room plan to start designing
              </div>
            ) : (
              <div
                ref={canvasRef}
                onClick={handleCanvasClick}
                style={{
                  width: '100%',
                  height: '100%',
                  border: '1px solid #e0e0e0',
                  borderRadius: THEME.borderRadius,
                  position: 'relative',
                  background: '#fff',
                  cursor: isPlacingPanel ? 'crosshair' : 'default',
                  overflow: 'hidden'
                }}
              >
                {/* PDF Display */}
                <iframe
                  src={pdfUrl}
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    pointerEvents: 'none'
                  }}
                />
                
                {/* Placed Panels */}
                {placedPanels.map(panel => (
                  <div
                    key={panel.id}
                    style={{
                      position: 'absolute',
                      left: panel.x - 100,
                      top: panel.y - 75,
                      width: 200,
                      height: 150,
                      cursor: 'pointer',
                      zIndex: 10
                    }}
                  >
                    <div style={{
                      position: 'relative',
                      width: '100%',
                      height: '100%'
                    }}>
                      <div style={{
                        transform: 'scale(0.6)',
                        transformOrigin: 'top left',
                        marginLeft: -20,
                        marginTop: -15
                      }}>
                        <PanelPreview
                          icons={panel.panelData.icons.map(icon => ({
                            ...icon,
                            src: icon.src || '',
                            category: icon.category || ''
                          }))}
                          panelDesign={panel.panelData.panelDesign || { backgroundColor: '', iconColor: '#000', textColor: '#000', fontSize: '12px' }}
                          type={panel.panelData.type}
                        />
                      </div>
                      <button
                        onClick={() => removePlacedPanel(panel.id)}
                        style={{
                          position: 'absolute',
                          top: -8,
                          right: -8,
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          background: '#ff6b6b',
                          color: '#fff',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: 14,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                        }}
                      >
                        ×
                      </button>
                      <div style={{
                        position: 'absolute',
                        bottom: -30,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: getRoomTypeColor(panel.roomType),
                        color: '#fff',
                        padding: '4px 8px',
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                      }}>
                        {getRoomTypeName(panel.roomType)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Legend */}
        <div style={{
          marginTop: 20,
          padding: 15,
          background: '#f8f9fa',
          borderRadius: THEME.borderRadius,
          border: '1px solid #e0e0e0'
        }}>
          <h4 style={{
            marginBottom: 10,
            color: THEME.textPrimary,
            fontSize: 16,
            fontWeight: 600
          }}>
            Room Type Legend
          </h4>
          <div style={{
            display: 'flex',
            gap: 15,
            flexWrap: 'wrap'
          }}>
            {roomTypes.map(roomType => (
              <div
                key={roomType.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                <div style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: roomType.color
                }} />
                <span style={{
                  fontSize: 14,
                  color: THEME.textSecondary
                }}>
                  {roomType.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 20,
          marginTop: 30
        }}>
          <button
            onClick={() => navigate("/cart")}
            style={{
              padding: '12px 24px',
              background: THEME.secondary,
              color: '#fff',
              border: 'none',
              borderRadius: THEME.buttonRadius,
              fontSize: 16,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
          >
            Back to Panels
          </button>
          <button
            onClick={() => {
              // Save layout functionality
              alert('Layout saved successfully!');
            }}
            style={{
              padding: '12px 24px',
              background: THEME.primary,
              color: '#fff',
              border: 'none',
              borderRadius: THEME.buttonRadius,
              fontSize: 16,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <Save fontSize="small" />
            Save Layout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Layouts; 