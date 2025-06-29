import React, { useState, useContext } from "react";
import { useCart } from "../contexts/CartContext";
import { useNavigate } from "react-router-dom";
import CartButton from "../components/CartButton";
import PanelPreview from "../components/PanelPreview";
import { Delete, Edit } from '@mui/icons-material';
import PanelConfigurationSummary from "../components/PanelConfigurationSummary";
import { ralColors } from "../data/ralColors";
import { ProjectContext } from "../App";

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

interface CartItem {
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
}

const getPanelTypeLabel = (type: string) => {
  switch (type) {
    case "SP": return "Single Panel";
    case "TAG": return "Thermostat";
    case "DPH": return "Double Panel - H";
    case "DPV": return "Double Panel - V";
    case "X2V": return "Extended Panel - V2";
    case "X2H": return "Extended Panel - H2";
    case "X1H": return "Extended Panel - H1";
    case "X1V": return "Extended Panel - V1";
    default: return "Panel";
  }
};

const ICON_COLOR_FILTERS: { [key: string]: string } = {
  '#000000': 'brightness(0) saturate(100%)',
  '#FFFFFF': 'brightness(0) saturate(100%) invert(1)',
  '#808080': 'brightness(0) saturate(100%) invert(52%) sepia(0%) saturate(0%) hue-rotate(148deg) brightness(99%) contrast(91%)',
  '#FF0000': 'brightness(0) saturate(100%) invert(13%) sepia(93%) saturate(7464%) hue-rotate(0deg) brightness(113%) contrast(109%)',
  '#0000FF': 'brightness(0) saturate(100%) invert(8%) sepia(100%) saturate(6495%) hue-rotate(247deg) brightness(98%) contrast(141%)',
  '#008000': 'brightness(0) saturate(100%) invert(23%) sepia(98%) saturate(3025%) hue-rotate(101deg) brightness(94%) contrast(104%)',
};

const ProjPanels: React.FC = () => {
  const { projPanels, updateQuantity, removeFromCart, currentProjectCode } = useCart();
  const navigate = useNavigate();
  
  // Load panel names for specific project code
  const loadPanelNames = (projectCode: string): string[] => {
    try {
      const stored = localStorage.getItem(`panelNames_${projectCode}`);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error(`Error loading panel names for project ${projectCode}:`, error);
      return [];
    }
  };

  const [panelNames, setPanelNames] = useState<string[]>(() => {
    const stored = loadPanelNames(currentProjectCode || 'default-project');
    // Ensure we have enough names for current panels
    while (stored.length < projPanels.length) stored.push("");
    return stored.slice(0, projPanels.length);
  });
  
  const { projectName, projectCode } = useContext(ProjectContext);

  // Save panel names for specific project code
  const savePanelNames = (projectCode: string, names: string[]) => {
    try {
      localStorage.setItem(`panelNames_${projectCode}`, JSON.stringify(names));
    } catch (error) {
      console.error(`Error saving panel names for project ${projectCode}:`, error);
    }
  };

  // Keep panelNames in sync if projPanels changes (e.g., remove/add)
  React.useEffect(() => {
    setPanelNames((prev) => {
      const arr = [...prev];
      while (arr.length < projPanels.length) arr.push("");
      if (arr.length > projPanels.length) arr.length = projPanels.length;
      return arr;
    });
  }, [projPanels.length]);

  // Save panel names whenever they change
  React.useEffect(() => {
    savePanelNames(currentProjectCode || 'default-project', panelNames);
  }, [panelNames, currentProjectCode]);

  // Load panel names when project code changes
  React.useEffect(() => {
    const stored = loadPanelNames(currentProjectCode || 'default-project');
    const arr = [...stored];
    while (arr.length < projPanels.length) arr.push("");
    setPanelNames(arr.slice(0, projPanels.length));
  }, [currentProjectCode, projPanels.length]);

  return (
    <div style={{
      minHeight: '100vh',
      background: THEME.background,
      padding: '0',
      fontFamily: THEME.fontFamily,
    }}>
      <div style={{
        maxWidth: 1100,
        margin: '0 auto',
        padding: '32px 16px',
        borderRadius: THEME.borderRadius,
        background: THEME.card,
        boxShadow: THEME.shadow,
        marginTop: 32,
        marginBottom: 32,
      }}>
        {/* Project Name at top */}
        {(projectName || projectCode) && (
          <div style={{
            textAlign: 'center',
            marginBottom: 24,
            padding: '12px 0',
            borderBottom: '1px solid #f0f0f0',
          }}>
            <span style={{
              fontSize: 16,
              color: THEME.textSecondary,
              fontWeight: 500,
              letterSpacing: 0.5,
              fontFamily: '"Myriad Hebrew", "Monsal Gothic", sans-serif',
            }}>
              {projectName}{projectCode && ` - ${projectCode}`}
            </span>
          </div>
        )}

        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h1 style={{
            fontWeight: 700,
            fontSize: 32,
            color: THEME.textPrimary,
            letterSpacing: '1px',
            marginBottom: 8,
            textShadow: '0 1px 2px rgba(0,0,0,0.08)'
          }}>Project Panels</h1>
          <div style={{
            width: 120,
            height: 5,
            margin: '0 auto',
            borderRadius: 3,
            background: THEME.primary,
            marginBottom: 8
          }} />
        </div>

        {projPanels.length === 0 ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300
          }}>
            <span style={{ fontSize: 64, color: '#e0e0e0', marginBottom: 16 }}>🗂️</span>
            <p style={{ fontSize: 20, color: THEME.textSecondary, marginBottom: 24 }}>Your project panels list is empty</p>
            <button
              onClick={() => navigate("/panel-type")}
              style={{
                padding: '14px 36px',
                background: THEME.primary,
                color: '#fff',
                border: 'none',
                borderRadius: THEME.buttonRadius,
                fontSize: 18,
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: THEME.shadow,
                letterSpacing: '0.5px',
                transition: 'background 0.2s, transform 0.2s',
              }}
            >Continue Designing !</button>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 32,
            marginBottom: 40,
          }}>
            {projPanels.map((item, index) => (
              <div
                key={index}
                style={{
                  background: THEME.card,
                  borderRadius: THEME.borderRadius,
                  boxShadow: THEME.cardShadow,
                  padding: 28,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 18,
                  alignItems: 'flex-start',
                  position: 'relative',
                  minHeight: 220,
                  border: '1px solid #f0f0f0',
                }}
              >
                {/* Panel Number and Name (in normal flow) */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  marginBottom: 12,
                }}>
                  <div style={{
                    background: THEME.primary,
                    color: '#fff',
                    borderRadius: 8,
                    fontWeight: 700,
                    fontSize: 20,
                    minWidth: 36,
                    height: 36,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 1px 4px rgba(27,146,209,0.10)',
                  }}>{index + 1}</div>
                  <input
                    type="text"
                    value={panelNames[index] || ""}
                    onChange={e => {
                      const newNames = [...panelNames];
                      newNames[index] = e.target.value;
                      setPanelNames(newNames);
                    }}
                    placeholder="Panel name..."
                    style={{
                      fontSize: 16,
                      border: '1px solid #e0e0e0',
                      borderRadius: 8,
                      padding: '7px 12px',
                      outline: 'none',
                      fontFamily: THEME.fontFamily,
                      minWidth: 180,
                      background: '#f8f9fa',
                      color: THEME.textPrimary,
                      fontWeight: 500,
                      boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                      transition: 'border 0.2s',
                    }}
                  />
                  <div style={{
                    background: THEME.secondary,
                    color: '#fff',
                    borderRadius: 6,
                    fontWeight: 600,
                    fontSize: 14,
                    padding: '6px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 1px 3px rgba(102,102,102,0.15)',
                    letterSpacing: '0.5px',
                    minWidth: 'fit-content',
                  }}>
                    {getPanelTypeLabel(item.type)}
                  </div>
                </div>
                {/* Quantity controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 10 }}>
                  <span style={{ color: THEME.textSecondary, fontSize: 15 }}>Quantity:</span>
                  <button
                    onClick={() => updateQuantity(index, item.quantity - 1)}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      border: 'none',
                      background: THEME.background,
                      color: THEME.primary,
                      fontSize: 22,
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: THEME.shadow,
                      transition: 'background 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      lineHeight: 1,
                      padding: 0,
                    }}
                    disabled={item.quantity <= 1}
                  >-</button>
                  <span style={{ fontSize: 18, fontWeight: 600, minWidth: 24, textAlign: 'center' }}>{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(index, item.quantity + 1)}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      border: 'none',
                      background: THEME.background,
                      color: THEME.primary,
                      fontSize: 22,
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: THEME.shadow,
                      transition: 'background 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      lineHeight: 1,
                      padding: 0,
                    }}
                  >+</button>
                </div>
                {/* Remove button */}
                <button
                  onClick={() => removeFromCart(index)}
                  style={{
                    position: 'absolute',
                    top: 18,
                    right: 18,
                    background: 'none',
                    border: 'none',
                    color: THEME.secondary,
                    cursor: 'pointer',
                    fontSize: 22,
                    padding: 0,
                    zIndex: 2,
                  }}
                  title="Remove panel"
                >
                  <Delete fontSize="inherit" />
                </button>
                {/* Edit Panel button */}
                <div style={{
                  position: 'absolute',
                  top: 18,
                  right: 60,
                  zIndex: 2,
                }}>
                  <button
                    onClick={() => {
                      // Navigate to the appropriate customizer based on panel type
                      const customizerRoutes: { [key: string]: string } = {
                        'SP': '/customizer/sp',
                        'TAG': '/customizer/tag',
                        'DPH': '/customizer/dph',
                        'DPV': '/customizer/dpv',
                        'X2V': '/customizer/x2v',
                        'X2H': '/customizer/x2h',
                        'X1H': '/customizer/x1h',
                        'X1V': '/customizer/x1v',
                      };
                      const route = customizerRoutes[item.type] || '/panel-type';
                      navigate(route, { 
                        state: { 
                          editMode: true, 
                          panelIndex: index,
                          panelData: item 
                        } 
                      });
                    }}
                    style={{
                      background: THEME.primary,
                      border: 'none',
                      color: '#fff',
                      cursor: 'pointer',
                      fontSize: 12,
                      fontWeight: 600,
                      padding: '6px 12px',
                      borderRadius: 6,
                      boxShadow: '0 1px 3px rgba(27,146,209,0.20)',
                      transition: 'all 0.2s ease',
                      letterSpacing: '0.3px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = THEME.primaryHover;
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = THEME.primary;
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                    title="Edit panel configuration"
                  >
                    <Edit sx={{ fontSize: 14 }} />
                    Edit Panel
                  </button>
                </div>
                {/* Panel Preview and Info Summary side by side */}
                <div style={{ display: 'flex', gap: 32, alignItems: 'center', width: '100%' }}>
                  <PanelPreview
                    icons={item.icons.map(icon => ({
                      ...icon,
                      src: icon.src || '',
                      category: icon.category || ''
                    }))}
                    panelDesign={item.panelDesign || { backgroundColor: '', iconColor: '#000', textColor: '#000', fontSize: '12px' }}
                    type={item.type}
                  />
                  <PanelConfigurationSummary
                    panelDesign={item.panelDesign}
                    icons={item.icons}
                    ralColors={ralColors}
                    ICON_COLOR_FILTERS={ICON_COLOR_FILTERS}
                    backbox={item.panelDesign?.backbox}
                    comments={item.panelDesign?.extraComments}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
        {/* Action Buttons */}
        {projPanels.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 32 }}>
            <button
              onClick={() => navigate("/panel-type")}
              style={{
                padding: '14px 36px',
                background: THEME.primary,
                color: '#fff',
                border: 'none',
                borderRadius: THEME.buttonRadius,
                fontSize: 18,
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: THEME.shadow,
                letterSpacing: '0.5px',
                transition: 'background 0.2s, transform 0.2s',
              }}
            >Continue Designing !</button>
            <button
              onClick={() => navigate("/layouts")}
              style={{
                padding: '14px 36px',
                background: THEME.secondary,
                color: '#fff',
                border: 'none',
                borderRadius: THEME.buttonRadius,
                fontSize: 18,
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: THEME.shadow,
                letterSpacing: '0.5px',
                transition: 'background 0.2s, transform 0.2s',
              }}
            >Proceed to Layouts</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjPanels; 