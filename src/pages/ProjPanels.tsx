import React, { useState, useContext, useEffect } from "react";
import { useCart } from "../contexts/CartContext";
import { useNavigate, useLocation } from "react-router-dom";
import CartButton from "../components/CartButton";
import PanelPreview from "../components/PanelPreview";
import { Delete, Edit } from '@mui/icons-material';
import PanelConfigurationSummary from "../components/PanelConfigurationSummary";
import { ralColors } from "../data/ralColors";
import { ProjectContext } from "../App";
import { saveDesign, getDesigns, updateDesign } from "../utils/database";
import { saveLayout, updateLayout, loadLayout } from "../utils/newDatabase";
import { listPropertyRevisions } from "../utils/newDatabase";
import { navigateToPrintPreviewMultiple } from "../utils/printUtils";

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

const PANEL_TYPE_PRIORITY: Record<string, number> = {
  IDPG: 0,
  SP: 1,
  TAG: 2,
  DPH: 3,
  X1H: 3,
  X2H: 3,
  DPV: 4,
  X1V: 4,
  X2V: 4,
};

const getPanelPriority = (type?: string) => {
  if (!type) return 99;
  return PANEL_TYPE_PRIORITY[type] ?? 99;
};

const getPanelTypeLabel = (type: string) => {
  switch (type) {
    case "SP": return "Single Panel";
    case "TAG": return "Thermostat";
    case "DPH": return "Horizontal Double Panel";
    case "DPV": return "Vertical Double Panel";
    case "X2V": return "Extended Panel, Vertical, 2 Sockets";
    case "X2H": return "Extended Panel, Horizontal, 2 Sockets";
    case "X1H": return "Extended Panel, Horizontal, 1 Socket";
    case "X1V": return "Extended Panel, Vertical, 1 Socket";
    case "IDPG": return "Corridor Panel";
    default: return "Panel";
  }
};


const mapTypeToCategory = (t: string): 'SP' | 'TAG' | 'IDPG' | 'DP' | 'EXT' => {
  if (t === 'SP') return 'SP';
  if (t === 'TAG') return 'TAG';
  if (t === 'IDPG') return 'IDPG';
  if (t === 'DPH' || t === 'DPV') return 'DP';
  if (t.startsWith('X')) return 'EXT';
  return 'SP';
};

const ProjPanels: React.FC = () => {
  const { projPanels, updateQuantity, removeFromCart, reorderPanels, updatePanel, currentProjectCode, loadProjectPanels } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const { projectName, setProjectName, projectCode, setProjectCode, location: projectLocation, operator } = useContext(ProjectContext);
  const { setLocation, setOperator, setServicePartner } = useContext(ProjectContext) as any;
  
  // State for panel number editing
  const [editingPanelIndex, setEditingPanelIndex] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState<string>('');
  
  // State for panel name editing
  const [editingNameIndex, setEditingNameIndex] = useState<number | null>(null);
  const [editingNameValue, setEditingNameValue] = useState<string>('');
  
  // Save design state
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  
  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [isCreateNewRevision, setIsCreateNewRevision] = useState(false);
  const [editingDesignId, setEditingDesignId]  = useState<string | null>(null);
  const [originalProjectName, setOriginalProjectName] = useState('');
  const [revisionNumber, setRevisionNumber] = useState<number>(1);
  const [projectJustSaved, setProjectJustSaved] = useState(false);
  
  // Handle edit mode when component loads
  useEffect(() => {
    console.log('🔍 ProjPanels useEffect - location.state:', location.state);
    // If session indicates edit mode, ensure view mode is off so interactions are enabled
    try {
      const sessIsEditFlag = sessionStorage.getItem('ppIsEditMode') === 'true';
      if (sessIsEditFlag) setIsViewMode(false);
    } catch {}
    
    if (location.state?.editMode && location.state?.projectData) {
      console.log('✅ Setting EDIT MODE');
      setIsEditMode(true);
      setIsViewMode(false);
      setEditingDesignId(location.state.designId);
      
      // Extract base project name without revision suffix
      const fullProjectName = location.state.projectData.projectName;
      const baseProjectName = fullProjectName.replace(/\s*\(rev\d+\)$/, '');
      setOriginalProjectName(fullProjectName); // Use full name with revision
      
      // Persist edit state in sessionStorage
      try {
        sessionStorage.setItem('ppIsEditMode', 'true');
        sessionStorage.setItem('ppEditingDesignId', location.state.designId);
        sessionStorage.setItem('ppProjectName', fullProjectName);
      } catch {}
      
      // Load the project data into the cart
      const projectData = location.state.projectData;
      
      // Clear existing panels and load the project panels with deep copies
      if (projectData.panels && Array.isArray(projectData.panels)) {
        console.log('Loading project panels for editing:', projectData.panels);
        // Create deep copies to prevent shared references
        const deepCopiedPanels = projectData.panels.map((panel: any) => JSON.parse(JSON.stringify(panel)));
        console.log('🔍 Clearing cart and loading new panels for editing');
        loadProjectPanels(deepCopiedPanels);
      }
      
      // Calculate revision number based on existing designs
      calculateRevisionNumber(baseProjectName, true, fullProjectName);
    } else if (location.state?.viewMode && location.state?.projectData) {
      console.log('✅ Setting VIEW MODE');
      // View mode - read-only
      setIsViewMode(true);
      setEditingDesignId(location.state.designId);
      
      const projectData = location.state.projectData;
      
      if (projectData.panels && Array.isArray(projectData.panels)) {
        console.log('Loading project panels for viewing:', projectData.panels);
        // Create deep copies to prevent shared references
        const deepCopiedPanels = projectData.panels.map((panel: any) => JSON.parse(JSON.stringify(panel)));
        loadProjectPanels(deepCopiedPanels);
      }
    } else if (location.state?.createNewRevision && location.state?.projectData) {
      console.log('✅ Setting NEW REVISION MODE');
      // Create new revision mode
      setIsCreateNewRevision(true);
      setEditingDesignId(location.state.originalDesignId);
      setOriginalProjectName(location.state.originalProjectName);
      // Ensure the context has the correct project name and persist it
      if (location.state.originalProjectName) {
        setProjectName(location.state.originalProjectName);
        try {
          sessionStorage.setItem('ppProjectName', location.state.originalProjectName);
          if (location.state.originalDesignId) {
            sessionStorage.setItem('ppEditingDesignId', location.state.originalDesignId);
          }
          sessionStorage.setItem('ppIsCreateNewRevision', 'true');
        } catch {}
      }
      
      const projectData = location.state.projectData;
      
      if (projectData.panels && Array.isArray(projectData.panels)) {
        console.log('Loading project panels for new revision:', projectData.panels);
        // Create deep copies to prevent shared references
        const deepCopiedPanels = projectData.panels.map((panel: any) => JSON.parse(JSON.stringify(panel)));
        loadProjectPanels(deepCopiedPanels);
      }
      
      // Calculate revision number for new revision
      calculateRevisionNumber(location.state.originalProjectName, false);
    } else if (location.state?.projectEditMode !== undefined) {
      console.log('✅ Restoring project edit state from customizer');
      console.log('  projectEditMode:', location.state.projectEditMode);
      console.log('  projectDesignId:', location.state.projectDesignId);
      console.log('  projectOriginalName:', location.state.projectOriginalName);
      console.log('  projectCreateNewRevision:', location.state.projectCreateNewRevision);
      // Restore edit state when returning from customizer
      setIsEditMode(location.state.projectEditMode);
      if (location.state.projectEditMode) setIsViewMode(false);
      setEditingDesignId(location.state.projectDesignId);
      setOriginalProjectName(location.state.projectOriginalName);
      setIsCreateNewRevision(location.state.projectCreateNewRevision);
      
      // Persist edit state in sessionStorage
      try {
        sessionStorage.setItem('ppIsEditMode', 'true');
        sessionStorage.setItem('ppEditingDesignId', location.state.projectDesignId);
        sessionStorage.setItem('ppProjectName', location.state.projectOriginalName);
      } catch {}
      
      // Reload the panels from the database to ensure we have the latest data
      const reloadPanelsFromDatabase = async () => {
        try {
          const userEmail = localStorage.getItem('userEmail');
          if (!userEmail || !location.state.projectDesignId) {
            console.log('❌ Cannot reload panels - missing userEmail or projectDesignId');
            return;
          }
          
          console.log('🔍 Attempting to reload panels from database (property-aware)');
          console.log('  projectDesignId:', location.state.projectDesignId);
          const propId = projectCode || (() => { try { return sessionStorage.getItem('ppProjectCode') || ''; } catch { return ''; } })();
          // Only reload if cart is empty to avoid overwriting unsaved in-memory edits
          if (propId && (!projPanels || projPanels.length === 0)) {
            const lr = await loadLayout(location.state.projectDesignId, userEmail);
            if ((lr as any).success) {
              const layout = (lr as any).layout;
              const data = (layout?.data) || {};
              if (data.panels && Array.isArray(data.panels)) {
                const deepCopiedPanels = data.panels.map((p: any) => JSON.parse(JSON.stringify(p)));
              loadProjectPanels(deepCopiedPanels);
            }
              if (layout?.name) setProjectName(layout.name);
          }
          }
        } catch (e) {
          console.log('❌ Error reloading panels:', e);
        }
      };
      reloadPanelsFromDatabase();
    } else {
      // Fallback: sessionStorage-based edit mode (e.g., coming from Properties Edit without router state)
      (async () => {
        try {
          const sessIsEdit = sessionStorage.getItem('ppIsEditMode') === 'true';
          const sessDesignId = sessionStorage.getItem('ppEditingDesignId') || '';
          const sessProjectName = sessionStorage.getItem('ppProjectName') || '';
          const sessProp = sessionStorage.getItem('ppProjectCode') || '';
          const userEmail = localStorage.getItem('userEmail') || '';
          if (sessIsEdit && sessDesignId && sessProp && userEmail) {
            console.log('🔁 Loading edit mode from sessionStorage. designId:', sessDesignId, 'prop:', sessProp);
          setIsEditMode(true);
            setIsViewMode(false);
            setEditingDesignId(sessDesignId);
            if (sessProjectName) setOriginalProjectName(sessProjectName);
            const lr = await loadLayout(sessDesignId, userEmail);
            if ((lr as any).success) {
              const layout = (lr as any).layout;
              if (layout?.name) {
                setProjectName(layout.name);
                setOriginalProjectName(layout.name);
              }
              const data = layout?.data || {};
              if (data.panels && Array.isArray(data.panels)) {
                const deepCopiedPanels = data.panels.map((p: any) => JSON.parse(JSON.stringify(p)));
                loadProjectPanels(deepCopiedPanels);
              }
            } else {
              console.log('⚠️ Failed to load layout from DB in session fallback:', lr);
            }
        }
      } catch {}
      })();
    }
  }, [location.state, loadProjectPanels, projectCode, setProjectName]);

  // Automatically enforce panel ordering and numbering by priority
  useEffect(() => {
    if (!projPanels || projPanels.length === 0) return;

    const panelsWithMeta = projPanels.map((panel, index) => ({
      panel,
      index,
      priority: getPanelPriority(panel.type),
    }));

    const sorted = [...panelsWithMeta].sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      return a.index - b.index;
    });

    const newOrder = sorted.map(item => item.index);
    const alreadySorted = newOrder.every((originalIndex, sortedIndex) => originalIndex === sortedIndex);

    if (!alreadySorted) {
      reorderPanels(newOrder);
      return;
    }

    let needsDisplayUpdate = false;
    sorted.forEach((item, idx) => {
      const desiredNumber = idx + 1;
      if (item.panel.displayNumber !== desiredNumber) {
        needsDisplayUpdate = true;
      }
    });

    if (!needsDisplayUpdate) return;

    sorted.forEach((item, idx) => {
      const desiredNumber = idx + 1;
      if (item.panel.displayNumber === desiredNumber) return;
      const updatedPanel = { ...item.panel, displayNumber: desiredNumber };
      updatePanel(item.index, updatedPanel);
    });
  }, [projPanels, reorderPanels, updatePanel]);
  
  // Calculate revision number for the project
  const calculateRevisionNumber = async (baseProjectName: string, isEditMode: boolean = false, currentDesignName?: string) => {
    try {
      const userEmail = localStorage.getItem('userEmail');
      if (!userEmail) return;
      
      console.log('🔍 calculateRevisionNumber called with:', baseProjectName, 'isEditMode:', isEditMode);
      
      if (isEditMode && currentDesignName) {
        // In edit mode, extract the current revision number from the design name
        const match = currentDesignName.match(/\(rev(\d+)\)$/);
        if (match) {
          const currentRevision = parseInt(match[1]);
          console.log('🔍 Edit mode - keeping current revision:', currentRevision);
          setRevisionNumber(currentRevision);
          return;
        }
      }
      
      const result = await getDesigns(userEmail);
      if (result.success && result.designs) {
        // Find all designs that start with the base project name
        const existingRevisions = result.designs.filter((design: any) => 
          design.design_name && design.design_name.startsWith(baseProjectName)
        );
        
        console.log('🔍 Found existing revisions for calculation:', existingRevisions.map(d => d.design_name));
        
        // Count how many revisions already exist
        let maxRevision = -1; // Start at -1 so first revision is rev0
        existingRevisions.forEach((design: any) => {
          const match = design.design_name.match(/\(rev(\d+)\)$/);
          if (match) {
            const revision = parseInt(match[1]);
            if (revision > maxRevision) {
              maxRevision = revision;
            }
          }
        });
        
        console.log('🔍 Max revision found in calculation:', maxRevision);
        setRevisionNumber(maxRevision + 1);
      }
    } catch (error) {
      console.error('Error calculating revision number:', error);
      setRevisionNumber(1);
    }
  };

  // Handle panel number editing
  const handlePanelNumberEdit = (index: number) => {
    setEditingPanelIndex(index);
    setEditingValue(getDisplayNumber(index).toString());
  };

  // Handle panel number save
  const handlePanelNumberSave = (index: number) => {
    const newNumber = parseFloat(editingValue);
    if (isNaN(newNumber) || newNumber <= 0) {
      // Invalid number, revert to original
      setEditingPanelIndex(null);
      return;
    }

    try {
      // Update the panel's display number using the updatePanel function
      const updatedPanel = { ...projPanels[index], displayNumber: newNumber };
      updatePanel(index, updatedPanel);
      
      // Auto-sort panels by their display numbers
      setTimeout(() => {
        const panelsWithIndices = projPanels.map((panel, i) => ({
          panel: i === index ? updatedPanel : panel,
          originalIndex: i,
          displayNumber: i === index ? newNumber : (panel.displayNumber || (i + 1))
        }));
        
        // Sort by display numbers
        panelsWithIndices.sort((a, b) => a.displayNumber - b.displayNumber);
        
        // Create new order array
        const newOrder = panelsWithIndices.map(item => item.originalIndex);
        
        // Reorder the panels
        reorderPanels(newOrder);
      }, 100); // Small delay to ensure the panel update is processed first
      
    } catch (error) {
      console.error('Error updating panel number:', error);
    }
    
    setEditingPanelIndex(null);
  };

  // Handle panel name editing
  const handlePanelNameEdit = (index: number) => {
    setEditingNameIndex(index);
    setEditingNameValue(projPanels[index].panelName || '');
  };

  // Handle panel name save
  const handlePanelNameSave = (index: number) => {
    try {
      // Update the panel's name using the updatePanel function
      const updatedPanel = { ...projPanels[index], panelName: editingNameValue.trim() };
      updatePanel(index, updatedPanel);
    } catch (error) {
      console.error('Error updating panel name:', error);
    }
    
    setEditingNameIndex(null);
  };

  // Handle panel name cancel
  const handlePanelNameCancel = () => {
    setEditingNameIndex(null);
  };

  // Handle key press in name edit mode
  const handleNameKeyPress = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter') {
      handlePanelNameSave(index);
    } else if (e.key === 'Escape') {
      handlePanelNameCancel();
    }
  };

  // Handle panel number cancel
  const handlePanelNumberCancel = () => {
    setEditingPanelIndex(null);
  };

  // Handle key press in edit mode
  const handleKeyPress = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter') {
      handlePanelNumberSave(index);
    } else if (e.key === 'Escape') {
      handlePanelNumberCancel();
    }
  };

  // Get display number for a panel
  const getDisplayNumber = (index: number) => {
    const panel = projPanels[index];
    return panel.displayNumber || (index + 1);
  };

  // 💾 Save entire project to database
  const handleSaveProject = async (): Promise<void> => {
    // Check if user is logged in (has email)
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
      setSaveMessage('Please log in first to save projects.');
      return;
    }

    // Check if there are panels to save
    if (projPanels.length === 0) {
      setSaveMessage('No panels to save. Add some panels first!');
      return;
    }

    setIsSaving(true);
    setSaveMessage('');

    try {
      // Read any persisted state to avoid losing name across navigations
      const persistedName = (() => { try { return sessionStorage.getItem('ppProjectName') || ''; } catch { return ''; } })();
      const persistedIsNewRev = (() => { try { return sessionStorage.getItem('ppIsCreateNewRevision') === 'true'; } catch { return false; } })();
      const persistedEditIdRaw = (() => { try { return sessionStorage.getItem('ppEditingDesignId') || ''; } catch { return ''; } })();
      const persistedEditId = persistedEditIdRaw || null;

      const effectiveOriginalName = originalProjectName || persistedName;
      // Use persisted "new revision" intent if we have a name but local flag got lost
      const effectiveIsCreateNewRevision = isCreateNewRevision || (Boolean(persistedName) && persistedIsNewRev && !editingDesignId);
      const effectiveEditingDesignId = editingDesignId || persistedEditId;

      let finalProjectName = effectiveOriginalName || projectName || 'Untitled Project';
      
      console.log('🔍 SAVE FUNCTION - Current state:');
      console.log('  isEditMode:', isEditMode);
      console.log('  editingDesignId:', effectiveEditingDesignId);
      console.log('  isCreateNewRevision:', effectiveIsCreateNewRevision);
      console.log('  originalProjectName:', effectiveOriginalName);
      
      if (isEditMode && effectiveEditingDesignId) {
        console.log('✅ Taking EDIT MODE path - updating existing design');
        // If we are working under a property, update layout in public.design directly
        if (projectCode && projectCode.trim() !== '') {
          const nameToKeep = effectiveOriginalName || projectName || 'Untitled Project (rev0)';
          const layoutData = {
            layout_name: nameToKeep,
            layout_data: {
              projectName: nameToKeep,
              projectCode: projectCode || '',
              location: projectLocation || (typeof sessionStorage !== 'undefined' ? (sessionStorage.getItem('ppLocation') || '') : ''),
              operator: operator || (typeof sessionStorage !== 'undefined' ? (sessionStorage.getItem('ppOperator') || '') : ''),
              servicePartner: (typeof sessionStorage !== 'undefined' ? (sessionStorage.getItem('ppServicePartner') || '') : ''),
              panels: projPanels.map((panel, index) => JSON.parse(JSON.stringify({
                ...panel,
                displayNumber: getDisplayNumber(index),
              })))
            }
          } as const;
          const result = await updateLayout(effectiveEditingDesignId, decodeURIComponent(userEmail), layoutData as any);
          if ((result as any).success) {
            setSaveMessage('✅ Project updated successfully!');
            setProjectJustSaved(true);
            try {
              sessionStorage.removeItem('ppIsEditMode');
              sessionStorage.removeItem('ppEditingDesignId');
              sessionStorage.removeItem('ppProjectName');
            } catch {}
            return;
          }
          setSaveMessage('❌ Failed to update project: ' + ((result as any).message || 'Update failed'));
        } else {
          // Legacy path for non-property projects: fallback to old update
            const projectData = {
            projectName: effectiveOriginalName || projectName || 'Untitled Project',
              panelType: 'Project',
              designData: {
              projectName: effectiveOriginalName || projectName || 'Untitled Project',
                projectCode: projectCode || '',
                location: projectLocation || (typeof sessionStorage !== 'undefined' ? (sessionStorage.getItem('ppLocation') || '') : ''),
                operator: operator || (typeof sessionStorage !== 'undefined' ? (sessionStorage.getItem('ppOperator') || '') : ''),
                servicePartner: (typeof sessionStorage !== 'undefined' ? (sessionStorage.getItem('ppServicePartner') || '') : ''),
                panels: projPanels.map((panel, index) => JSON.parse(JSON.stringify({
                  ...panel,
                  displayNumber: getDisplayNumber(index),
                })))
              }
            };
            const result = await updateDesign(decodeURIComponent(userEmail), effectiveEditingDesignId, projectData);
            if (result.success) {
              setSaveMessage('✅ Project updated successfully!');
              setProjectJustSaved(true);
              try {
                sessionStorage.removeItem('ppIsEditMode');
                sessionStorage.removeItem('ppEditingDesignId');
                sessionStorage.removeItem('ppProjectName');
              } catch {}
            } else {
              setSaveMessage('❌ Failed to update project: ' + result.message);
            }
        }
      }
      
      // If we're not in edit mode (or fell back from edit mode), create new design
      if (!isEditMode) {
        console.log('✅ Taking NEW PROJECT path - creating new design');
        
        // Strip any existing revision number from the project name
        const baseProjectName = finalProjectName.replace(/\s*\(rev\d+\)$/, '');
        console.log('🔍 Base project name (stripped):', baseProjectName);
        
        // If we have a property code, use property revisions to compute next revision name
        const designsResult = projectCode
          ? await (async () => {
              const r = await listPropertyRevisions(userEmail, projectCode);
              if (r && (r as any).success && (r as any).revisions) {
                const mapped = (r as any).revisions.map((d: any) => ({ design_name: d.name }));
                return { success: true, designs: mapped } as any;
              }
              return { success: false } as any;
            })()
          : await getDesigns(userEmail);
        if (designsResult.success && 'designs' in designsResult) {
          // First, check if we have a project name that already exists (indicating we're updating)
                      const existingDesignWithSameName = designsResult.designs?.find((design: any) => 
            design.design_name === projectName
          );
          
          if (existingDesignWithSameName && !effectiveIsCreateNewRevision) {
            // We're updating an existing design from this session (but NOT creating a new revision)
            console.log('✅ Updating existing design from current session:', projectName);
            finalProjectName = projectName; // Keep the same name
            
            const projectData = {
              projectName: finalProjectName,
              panelType: 'Project',
              designData: {
                projectName: finalProjectName,
                projectCode: projectCode || '',
                location: projectLocation || (typeof sessionStorage !== 'undefined' ? (sessionStorage.getItem('ppLocation') || '') : ''),
                operator: operator || (typeof sessionStorage !== 'undefined' ? (sessionStorage.getItem('ppOperator') || '') : ''),
                servicePartner: (typeof sessionStorage !== 'undefined' ? (sessionStorage.getItem('ppServicePartner') || '') : ''),
                panels: projPanels.map((panel, index) => JSON.parse(JSON.stringify({
                  ...panel,
                  displayNumber: getDisplayNumber(index),
                })))
              }
            };

            // Update existing design
            const result = await updateDesign(decodeURIComponent(userEmail), existingDesignWithSameName.id, projectData);
            
            if (result.success) {
              setSaveMessage('✅ Project updated successfully!');
              setProjectJustSaved(true);
            } else {
              setSaveMessage('❌ Failed to update project: ' + result.message);
            }
            return; // Exit early since we've handled the update
          }
          
          // Also check if we have a project name with revision number that matches our current projectName
          // This handles the case where projectName was updated after first save
          if (projectName && projectName.includes('(rev') && !effectiveIsCreateNewRevision) {
            const existingDesignWithRevision = designsResult.designs?.find((design: any) => 
              design.design_name === projectName
            );
            
            if (existingDesignWithRevision) {
              // We're updating an existing design with revision number
              console.log('✅ Updating existing design with revision:', projectName);
              finalProjectName = projectName; // Keep the same name
              
              const projectData = {
                projectName: finalProjectName,
                panelType: 'Project',
                designData: {
                  projectName: finalProjectName,
                  projectCode: projectCode || '',
                  location: projectLocation || (typeof sessionStorage !== 'undefined' ? (sessionStorage.getItem('ppLocation') || '') : ''),
                  operator: operator || (typeof sessionStorage !== 'undefined' ? (sessionStorage.getItem('ppOperator') || '') : ''),
                  servicePartner: (typeof sessionStorage !== 'undefined' ? (sessionStorage.getItem('ppServicePartner') || '') : ''),
                  panels: projPanels.map((panel, index) => JSON.parse(JSON.stringify({
                    ...panel,
                    displayNumber: getDisplayNumber(index),
                  })))
                }
              };

              // Update existing design
              const result = await updateDesign(decodeURIComponent(userEmail), existingDesignWithRevision.id, projectData);
              
              if (result.success) {
                setSaveMessage('✅ Project updated successfully!');
                setProjectJustSaved(true);
              } else {
                setSaveMessage('❌ Failed to update project: ' + result.message);
              }
              return; // Exit early since we've handled the update
            }
          }
          
          // Check if there are any existing designs with this base project name
          const existingDesigns = (designsResult.designs || []).filter((design: any) => 
            design.design_name === baseProjectName || 
            (design.design_name && design.design_name.startsWith(baseProjectName + ' (rev'))
          );
          
          if ((existingDesigns as any[]).length > 0) {
            // There are existing designs, so this should be a new revision
            let maxRevision = -1; // Start at -1 so first revision is rev0
            (existingDesigns as any[]).forEach((design: any) => {
              const match = design.design_name.match(/\(rev(\d+)\)$/);
              if (match) {
                const revision = parseInt(match[1]);
                if (revision > maxRevision) {
                  maxRevision = revision;
                }
              }
            });
            
            const nextRevision = maxRevision + 1;
            finalProjectName = `${baseProjectName} (rev${nextRevision})`;
            console.log('🔍 Next revision number:', nextRevision, 'Final name:', finalProjectName);
          } else {
            // This is the first design, add rev0
            finalProjectName = `${baseProjectName} (rev0)`;
            console.log('🔍 First design, adding rev0. Final name:', finalProjectName);
          }
        } else {
          // If we can't get designs, default to rev0 for first design
          finalProjectName = `${baseProjectName} (rev0)`;
          console.log('🔍 Can\'t get designs, defaulting to rev0. Final name:', finalProjectName);
        }

        // Prefer saving into the property-based revisions table when we have a projectCode
        let saveResult: any;
        if (projectCode && projectCode.trim() !== '') {
          const layoutPayload = {
            layoutName: finalProjectName,
            projectName: finalProjectName,
            projectCode: projectCode || '',
            location: projectLocation || (typeof sessionStorage !== 'undefined' ? (sessionStorage.getItem('ppLocation') || '') : ''),
            operator: operator || (typeof sessionStorage !== 'undefined' ? (sessionStorage.getItem('ppOperator') || '') : ''),
            servicePartner: (typeof sessionStorage !== 'undefined' ? (sessionStorage.getItem('ppServicePartner') || '') : ''),
            panels: projPanels.map((panel, index) => JSON.parse(JSON.stringify({
              ...panel,
              displayNumber: getDisplayNumber(index),
            })))
          };
          saveResult = await saveLayout(userEmail, layoutPayload as any, projectCode);
        } else {
        const projectData = {
          projectName: finalProjectName,
          panelType: 'Project',
          designData: {
            projectName: finalProjectName,
            projectCode: projectCode || '',
            location: projectLocation || (typeof sessionStorage !== 'undefined' ? (sessionStorage.getItem('ppLocation') || '') : ''),
            operator: operator || (typeof sessionStorage !== 'undefined' ? (sessionStorage.getItem('ppOperator') || '') : ''),
            servicePartner: (typeof sessionStorage !== 'undefined' ? (sessionStorage.getItem('ppServicePartner') || '') : ''),
            panels: projPanels.map((panel, index) => JSON.parse(JSON.stringify({
              ...panel,
              displayNumber: getDisplayNumber(index),
            })))
          }
        };
          // Fallback to legacy save if no property context
          saveResult = await saveDesign(userEmail, projectData, projectLocation, operator);
        }
        
        if (saveResult.success) {
          setSaveMessage('✅ Project saved successfully!');
          setProjectJustSaved(true);
          // Update the project name to the saved name
          setProjectName(finalProjectName);
          // After first save, switch to edit mode and persist the saved design ID so subsequent saves update rev0
          try {
            const savedDesignId = (saveResult as any).designId || (saveResult as any).layoutId;
            if (savedDesignId) {
              setIsEditMode(true);
              setEditingDesignId(savedDesignId);
              setOriginalProjectName(finalProjectName);
              sessionStorage.setItem('ppIsEditMode', 'true');
              sessionStorage.setItem('ppEditingDesignId', savedDesignId);
              sessionStorage.setItem('ppProjectName', finalProjectName);
              sessionStorage.removeItem('ppIsCreateNewRevision');
            }
          } catch {}
        } else {
          setSaveMessage('❌ Failed to save project: ' + saveResult.message);
        }
      }
    } catch (error) {
      console.error('Error saving project:', error);
      setSaveMessage('❌ Error saving project. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

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
          }}>
            {isEditMode ? `Editing: ${originalProjectName}` : 'Project Panels'}
          </h1>
          {isEditMode && (
            <div style={{
              background: '#fff3cd',
              color: '#856404',
              padding: '8px 16px',
              borderRadius: 6,
              marginBottom: 16,
              fontSize: 14,
              fontWeight: 500,
            }}>
              ✏️ Edit Mode - Saving will update Rev{revisionNumber}
            </div>
          )}
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
              onClick={() => {
                // If creating a new revision, treat as adding to existing project so we don't force BOQ
                if (isCreateNewRevision) {
                  navigate("/panel-type", { state: { isAddingToExistingProject: true } });
                } else {
                  navigate("/panel-type");
                }
              }}
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
                {/* Panel Number and Type */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  marginBottom: 12,
                }}>
                  {editingPanelIndex === index ? (
                    // Edit mode
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}>
                      <input
                        type="text"
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        onKeyDown={(e) => handleKeyPress(e, index)}
                        onBlur={() => handlePanelNumberSave(index)}
                        style={{
                          background: THEME.primary,
                          color: '#fff',
                          borderRadius: 8,
                          fontWeight: 700,
                          fontSize: 20,
                          width: 60,
                          height: 36,
                          border: 'none',
                          textAlign: 'center',
                          boxShadow: '0 1px 4px rgba(27,146,209,0.10)',
                          outline: 'none',
                        }}
                        autoFocus
                      />
                      <div style={{ fontSize: 12, color: THEME.textSecondary }}>
                        Press Enter to save, Esc to cancel
                      </div>
                    </div>
                  ) : (
                    // Display mode
                    <div 
                      style={{
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
                        cursor: isViewMode ? 'default' : 'pointer',
                        transition: 'all 0.2s ease',
                        pointerEvents: isViewMode ? 'none' : 'auto',
                      }}
                      onClick={!isViewMode ? () => handlePanelNumberEdit(index) : undefined}
                      onMouseEnter={!isViewMode ? (e) => {
                        e.currentTarget.style.background = THEME.primaryHover;
                        e.currentTarget.style.transform = 'scale(1.05)';
                      } : undefined}
                      onMouseLeave={!isViewMode ? (e) => {
                        e.currentTarget.style.background = THEME.primary;
                        e.currentTarget.style.transform = 'scale(1)';
                      } : undefined}
                      title={!isViewMode ? "Click to edit panel number" : undefined}
                    >
                      {getDisplayNumber(index)}
                    </div>
                  )}
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
                
                {/* Panel Name */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  marginBottom: 12,
                }}>
                  <span style={{ color: THEME.textSecondary, fontSize: 15, fontWeight: 500 }}>Name:</span>
                  <div 
                    style={{
                      background: '#f8f9fa',
                      color: THEME.textPrimary,
                      borderRadius: 6,
                      fontWeight: 500,
                      fontSize: 15,
                      padding: '8px 12px',
                      border: '1px solid #e9ecef',
                      cursor: 'default',
                      minWidth: 200,
                      maxWidth: 300,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    title={item.panelName || "Panel name"}
                  >
                    {item.panelName || "Panel"}
                  </div>
                </div>
                {/* Quantity with editable Allocated and read-only Max Allowed */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 10 }}>
                    <span style={{ color: THEME.textSecondary, fontSize: 15 }}>Quantity:</span>
                    {/* Allocated (editable) */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button
                        onClick={() => {
                          const maxAllowed = typeof (item as any).maxQuantity === 'number' ? (item as any).maxQuantity : Number.POSITIVE_INFINITY;
                          const next = Math.max(0, Math.min((item.quantity || 0) - 1, maxAllowed));
                          updateQuantity(index, next);
                        }}
                        disabled={(item.quantity || 0) <= 0 || isViewMode}
                        style={{
                          background: '#eef7ff',
                          border: '1px solid #d6e9ff',
                          borderRadius: 6,
                          width: 28,
                          height: 28,
                          cursor: isViewMode ? 'not-allowed' : 'pointer',
                          color: '#1b92d1'
                        }}
                        title="Decrease allocated"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => {
                          const raw = parseInt(e.target.value);
                          const val = isNaN(raw) ? 0 : raw;
                          const maxAllowed = typeof (item as any).maxQuantity === 'number' ? (item as any).maxQuantity : Number.POSITIVE_INFINITY;
                          const clamped = Math.max(0, Math.min(val, maxAllowed));
                          updateQuantity(index, clamped);
                        }}
                        readOnly={isViewMode}
                        style={{
                          width: 70,
                          textAlign: 'center',
                          fontSize: 16,
                          fontWeight: 600,
                          color: THEME.textPrimary,
                          background: '#f8f9fa',
                          padding: '6px 8px',
                          borderRadius: 6,
                          border: '1px solid #e9ecef'
                        }}
                        min={0}
                        max={typeof (item as any).maxQuantity === 'number' ? (item as any).maxQuantity : undefined}
                      />
                      <button
                        onClick={() => {
                          const maxAllowed = typeof (item as any).maxQuantity === 'number' ? (item as any).maxQuantity : Number.POSITIVE_INFINITY;
                          const next = Math.max(0, Math.min((item.quantity || 0) + 1, maxAllowed));
                          updateQuantity(index, next);
                        }}
                        disabled={isViewMode || (typeof (item as any).maxQuantity === 'number' && (item.quantity || 0) >= (item as any).maxQuantity)}
                        style={{
                          background: '#eef7ff',
                          border: '1px solid #d6e9ff',
                          borderRadius: 6,
                          width: 28,
                          height: 28,
                          cursor: isViewMode ? 'not-allowed' : 'pointer',
                          color: '#1b92d1'
                        }}
                        title="Increase allocated"
                      >
                        +
                      </button>
                    </div>
                    {/* Max Allowed (read-only) */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{
                        fontSize: 12,
                        color: THEME.textSecondary,
                        background: '#fff4e6',
                        border: '1px solid #ffe0bf',
                        padding: '4px 10px',
                        borderRadius: 999,
                        fontWeight: 600
                      }}>Max allowed: {typeof (item as any).maxQuantity === 'number' ? (item as any).maxQuantity : '-'}</span>
                    </div>
                  </div>
                
                {/* Quantity display - Only shown in view mode */}
                {isViewMode && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 10 }}>
                    <span style={{ color: THEME.textSecondary, fontSize: 15 }}>Quantity:</span>
                    <span style={{ fontSize: 18, fontWeight: 600, minWidth: 24, textAlign: 'center' }}>{item.quantity}</span>
                  </div>
                )}
                {/* Remove button - Hidden in view mode */}
                {!isViewMode && (
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
                )}
                
                {/* Edit Panel button - Hidden in view mode */}
                {!isViewMode && (
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
                          'IDPG': '/customizer/idpg',
                        };
                        const route = customizerRoutes[item.type] || '/panel-type';
                        navigate(route, { 
                          state: { 
                            editMode: true, 
                            panelIndex: index,
                            panelData: item,
                            // Preserve the project-level edit state
                            projectEditMode: isEditMode,
                            projectDesignId: editingDesignId,
                            projectOriginalName: originalProjectName,
                            projectCreateNewRevision: isCreateNewRevision
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
                )}
                {/* Panel Preview and Info Summary - stacked for horizontal panels */}
                <div style={{ 
                  display: 'flex', 
                  gap: 32, 
                  alignItems: 'center', 
                  width: '100%',
                  flexDirection: (item.type === 'X2H' || item.type === 'X1H' || item.type === 'DPH') ? 'column' : 'row'
                }}>
                  <PanelPreview
                    icons={item.icons.map(icon => ({
                      ...icon,
                      src: icon.src || '',
                      category: icon.category || '',
                      iconId: icon.iconId || undefined,
                    }))}
                    panelDesign={
                      item.type === 'TAG'
                        ? {
                            ...(item.panelDesign || { backgroundColor: '', iconColor: '#000', textColor: '#000', fontSize: '12px' }),
                            tagConfig: { ...(item.panelDesign?.tagConfig || { dimension: 'wide' }) },
                          }
                        : (item.panelDesign || { backgroundColor: '', iconColor: '#000', textColor: '#000', fontSize: '12px' })
                    }
                    type={item.type}
                    iconTexts={item.iconTexts}
                  />

                  <PanelConfigurationSummary
                    panelDesign={item.panelDesign}
                    icons={item.icons}
                    ralColors={ralColors}
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
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, marginTop: 32 }}>
            {/* Print and Save Buttons Row */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
              {/* Print Project Button */}
              <button
                onClick={() => {
                                     const panelConfigs = projPanels.map((panel, index) => ({
                     icons: panel.icons.map(icon => ({
                       src: icon.src || '',
                       label: icon.label || '',
                       position: icon.position,
                       text: icon.text || '',
                       category: icon.category || undefined,
                       iconId: icon.iconId || undefined,
                     })),
                     panelDesign: panel.panelDesign || { backgroundColor: '', iconColor: '#000', textColor: '#000', fontSize: '12px' },
                     iconTexts: {},
                     type: panel.type,
                     name: panel.panelName || `Panel ${index + 1}`
                   }));
                  navigateToPrintPreviewMultiple(navigate, panelConfigs, projectName || 'Project', projectCode);
                }}
                style={{
                  padding: '12px 28px',
                  background: 'transparent',
                  color: '#1a1f2c',
                  border: '2px solid #1a1f2c',
                  borderRadius: THEME.buttonRadius,
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: THEME.shadow,
                  letterSpacing: '0.5px',
                  transition: 'all 0.2s, transform 0.2s',
                }}
                              >
                  🖨️ Print Project
                </button>
              
              {/* Save Project Button - Hidden in view mode */}
              {!isViewMode && (
                <button
                  onClick={handleSaveProject}
                  disabled={isSaving}
                  style={{
                    padding: '12px 28px',
                    background: '#27ae60',
                    color: '#fff',
                    border: 'none',
                    borderRadius: THEME.buttonRadius,
                    fontSize: 16,
                    fontWeight: 600,
                    cursor: isSaving ? 'not-allowed' : 'pointer',
                    boxShadow: THEME.shadow,
                    letterSpacing: '0.5px',
                    transition: 'background 0.2s, transform 0.2s',
                    opacity: isSaving ? 0.7 : 1,
                  }}
                >
                  {isSaving ? '💾 Saving...' : 
                   isCreateNewRevision ? '💾 Save as New Rev' :
                   '💾 Save Project'}
                </button>
              )}
            </div>
            
            {/* Save Message */}
            {saveMessage && (
              <div style={{ 
                color: saveMessage.includes('✅') ? '#27ae60' : '#e74c3c',
                textAlign: 'center',
                fontSize: 14,
                fontWeight: 500,
              }}>
                {saveMessage}
              </div>
            )}
            
            {/* Back to Properties Button - appears after successful save */}
            {projectJustSaved && (
              <button
                onClick={() => navigate("/properties")}
                style={{
                  padding: '12px 24px',
                  background: '#3498db',
                  color: '#fff',
                  border: 'none',
                  borderRadius: THEME.buttonRadius,
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: THEME.shadow,
                  letterSpacing: '0.5px',
                  transition: 'background 0.2s, transform 0.2s',
                  marginTop: 8,
                }}
              >
                ← Back to Properties
              </button>
            )}
            
            {/* Go Back to My Designs Button - Always visible in view mode */}
            {isViewMode && (
              <button
                onClick={() => {
                  navigate('/my-designs');
                }}
                style={{
                  padding: '14px 36px',
                  background: '#3498db',
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
              >
                ← Go Back
              </button>
            )}
            
            {/* Navigation Buttons - Hidden in view mode */}
            {!isViewMode && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap' }}>
            <button
                  onClick={() => {
                    setProjectJustSaved(false); // Reset the saved state
                    if (isEditMode) {
                      // If in edit mode, preserve the edit context
                      navigate("/panel-type", { 
                        state: { 
                          editMode: true,
                          projectData: {
                            projectName: originalProjectName,
                            projectCode: projectCode,
                            panels: projPanels
                          },
                          designId: editingDesignId
                        }
                      });
                    } else {
                      // New project vs new revision
                      if (isCreateNewRevision) {
                        // Bypass BOQ redirect when adding to an existing project as a new revision
                        navigate("/panel-type", { state: { isAddingToExistingProject: true } });
                      } else {
                        // Normal navigation for new projects → go to panel type selector
                        navigate("/panel-type");
                      }
                    }
                  }}
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
                >
                  {isEditMode ? 'Continue Editing' : 'Continue Designing'} !
                </button>
            <button
                  onClick={() => {
                    setProjectJustSaved(false); // Reset the saved state
                    navigate("/layouts");
                  }}
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
                >
                  Proceed to Layouts
                </button>

              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjPanels; 