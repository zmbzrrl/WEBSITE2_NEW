import React, { useState, useRef, useCallback, useContext, useEffect } from "react";
import { useCart } from "../contexts/CartContext";
import { useNavigate } from "react-router-dom";
import CartButton from "../components/CartButton";
import { Add, Save, Upload } from '@mui/icons-material';
import PanelPreview from "../components/PanelPreview";
import { ralColors } from "../data/ralColors";
import { ProjectContext } from '../App';
import { saveLayout, getLayouts, loadLayout, updateLayout, deleteLayout as deleteLayoutApi, getAccessibleProperties } from "../utils/newDatabase";
import { importDatabaseDataNew, loadJsonFromFile, validateImportDataNew } from "../utils/databaseImporterNew";

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
      iconSize?: string;
      fonts?: string;
      backbox?: string;
      extraComments?: string;
    };
  };
}

interface PlacedDevice {
  id: string;
  type: string;
  x: number;
  y: number;
  roomType: string;
}

const DEVICE_TYPES = {
  doorContact: { name: 'Door Contact', color: '#4CAF50' },
  pirSensor: { name: 'PIR Sensor', color: '#FF9800' },
  windowContact: { name: 'Window Contact', color: '#9C27B0' },
  inbuiltPir: { name: 'In-built PIR', color: '#F44336' }
};

const Layouts: React.FC = () => {
  const navigate = useNavigate();
  const { projPanels } = useCart();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageScale, setImageScale] = useState<number>(1);
  const [imagePosition, setImagePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [imageFit, setImageFit] = useState<'cover' | 'contain' | 'fill'>('contain');
  const [selectedRoomType, setSelectedRoomType] = useState<string>('Bedroom');
  const [selectedPanelIndex, setSelectedPanelIndex] = useState<number | null>(null);
  const [placedPanels, setPlacedPanels] = useState<PlacedPanel[]>([]);
  const [isPlacingPanel, setIsPlacingPanel] = useState(false);
  const [showPanelSelector, setShowPanelSelector] = useState(false);
  const [isPlacingDevice, setIsPlacingDevice] = useState(false);
  const [selectedDeviceType, setSelectedDeviceType] = useState<string | null>(null);
  const [hoveredPanelId, setHoveredPanelId] = useState<string | null>(null);
  const [draggedPanelId, setDraggedPanelId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [draggedDeviceId, setDraggedDeviceId] = useState<string | null>(null);
  const [deviceDragOffset, setDeviceDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [panelSizes, setPanelSizes] = useState<{ [key: string]: number }>({});
  const [deviceSizes, setDeviceSizes] = useState<{ [key: string]: number }>({});
  const [resizingPanelId, setResizingPanelId] = useState<string | null>(null);
  const [resizingDeviceId, setResizingDeviceId] = useState<string | null>(null);
  const [layouts, setLayouts] = useState<Array<{
    id: string;
    name: string;
    imageUrl: string | null;
    imageFile: File | null;
    imageScale: number;
    imagePosition: { x: number; y: number };
    imageFit: 'cover' | 'contain' | 'fill';
    placedPanels: PlacedPanel[];
    placedDevices: PlacedDevice[];
    panelSizes: { [key: string]: number };
    databaseId?: string; // ID in the database (if saved)
    imageBase64?: string; // Base64 encoded image for database storage
  }>>([{
    id: '1',
    name: 'Layout 1',
    imageUrl: null,
    imageFile: null,
    imageScale: 1,
    imagePosition: { x: 0, y: 0 },
    imageFit: 'contain',
    placedPanels: [],
    placedDevices: [],
    panelSizes: {}
  }]);
  const [currentLayoutId, setCurrentLayoutId] = useState<string>('1');
  const canvasRef = useRef<HTMLDivElement>(null);
  const { projectName, projectCode } = useContext(ProjectContext);
  
  // Save layout state
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string>('');
  const [saveError, setSaveError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Debounce timer for auto-save
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // JSON import state
  const [isImportingJson, setIsImportingJson] = useState(false);
  const [importDragActive, setImportDragActive] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  
  // Property selector state
  const [accessibleProperties, setAccessibleProperties] = useState<any[]>([]);
  const [selectedPropId, setSelectedPropId] = useState<string>('');
  const [showCreatePropertyDialog, setShowCreatePropertyDialog] = useState(false);

  const handleImportFile = async (file: File) => {
    if (!file || !file.name.toLowerCase().endsWith('.json')) {
      setImportError('Please drop a .json file');
      return;
    }
    setIsImportingJson(true);
    setImportError(null);
    try {
      const jsonData = await loadJsonFromFile(file);
      const validation = validateImportDataNew(jsonData as any);
      if (!validation.valid) {
        setImportError(`Validation failed: ${validation.errors.join(', ')}`);
        return;
      }
      const results = await importDatabaseDataNew(jsonData as any);
      if (!results.success || !results.results) {
        setImportError(results.message || 'Import failed');
        return;
      }
      setShowCreatePropertyDialog(false);
      // Navigate to Panel Type Selector with BOQ context
      try {
        sessionStorage.setItem('boqProjectIds', JSON.stringify(results.results.project_ids || []));
        sessionStorage.setItem('boqImportResults', JSON.stringify(results.results));
      } catch {}
      navigate('/panel-type', { state: { importResults: results.results, projectIds: results.results.project_ids } });
    } catch (e: any) {
      setImportError(e?.message ? String(e.message) : 'Failed to import file');
    } finally {
      setIsImportingJson(false);
      setImportDragActive(false);
    }
  };

  const handleImportDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setImportDragActive(false);
    const file = event.dataTransfer.files?.[0];
    if (file) handleImportFile(file);
  };
  const handleImportDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setImportDragActive(true);
  };
  const handleImportDragLeave = () => setImportDragActive(false);

  // Project context state (same as panel designs)
  const [sessionProjectCode, setSessionProjectCode] = useState<string>(() => {
    try {
      return sessionStorage.getItem('ppProjectCode') || '';
    } catch { return ''; }
  });
  
  // Helper function: Convert File to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // Helper function: Convert base64 to data URL (if not already)
  const base64ToDataUrl = (base64: string): string => {
    if (base64.startsWith('data:')) return base64;
    return `data:image/jpeg;base64,${base64}`;
  };

  // Clear save messages after 5 seconds
  useEffect(() => {
    if (saveMessage || saveError) {
      const timer = setTimeout(() => {
        setSaveMessage('');
        setSaveError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [saveMessage, saveError]);

  // Load layouts from database on mount
  useEffect(() => {
    const loadLayoutsFromDatabase = async () => {
      const userEmail = localStorage.getItem('userEmail');
      const projectKey = projectCode || sessionProjectCode || localStorage.getItem('projectCode');
      
      if (!userEmail || !projectKey) {
        console.log('Layouts: Missing userEmail or projectKey, skipping database load');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        console.log('Layouts: Loading layouts from database for user:', userEmail, 'project:', projectKey);
        const result = await getLayouts(userEmail, projectKey);
        
        if (result.success && result.layouts && result.layouts.length > 0) {
          console.log('Layouts: Loaded', result.layouts.length, 'layouts from database');
          
          // Convert database layouts to local format
          const loadedLayouts = await Promise.all(result.layouts.map(async (dbLayout: any) => {
            const layoutData = dbLayout.layout_data || {};
            let imageUrl = null;
            let imageBase64 = null;
            
            // Handle image - if we have base64 data, convert to data URL
            if (layoutData.imageBase64) {
              imageBase64 = layoutData.imageBase64;
              imageUrl = base64ToDataUrl(imageBase64);
            } else if (layoutData.imageUrl && layoutData.imageUrl.startsWith('data:')) {
              imageUrl = layoutData.imageUrl;
              imageBase64 = layoutData.imageUrl;
            }
            
            return {
              id: dbLayout.id || Date.now().toString() + Math.random(),
              databaseId: dbLayout.id,
              name: layoutData.layout_name || layoutData.layoutName || dbLayout.layout_name || 'Untitled Layout',
              imageUrl,
              imageFile: null, // File objects can't be restored from database
              imageBase64,
              imageScale: layoutData.imageScale || 1,
              imagePosition: layoutData.imagePosition || { x: 0, y: 0 },
              imageFit: layoutData.imageFit || 'contain',
              placedPanels: layoutData.placedPanels || [],
              placedDevices: layoutData.placedDevices || [],
              panelSizes: layoutData.panelSizes || {}
            };
          }));
          
          if (loadedLayouts.length > 0) {
            setLayouts(loadedLayouts);
            setCurrentLayoutId(loadedLayouts[0].id);
            setSelectedRoomType(loadedLayouts[0].name || 'Bedroom');
            // Restore panel and device sizes from first layout or combine from all
            const allPanelSizes: { [key: string]: number } = {};
            const allDeviceSizes: { [key: string]: number } = {};
            loadedLayouts.forEach(layout => {
              Object.assign(allPanelSizes, layout.panelSizes);
            });
            // Device sizes might be in layout data
            loadedLayouts.forEach(layout => {
              const layoutData = result.layouts.find((l: any) => l.id === layout.databaseId)?.layout_data;
              if (layoutData?.deviceSizes) {
                Object.assign(allDeviceSizes, layoutData.deviceSizes);
              }
            });
            setPanelSizes(allPanelSizes);
            setDeviceSizes(allDeviceSizes);
            console.log('Layouts: State restored from database');
          }
        } else {
          console.log('Layouts: No layouts found in database, using default');
        }
      } catch (error) {
        console.error('Layouts: Error loading from database:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLayoutsFromDatabase();
  }, [projectCode, sessionProjectCode]);

  // Helper functions for current layout (defined early for use in effects)
  const getCurrentLayout = useCallback(() => {
    return layouts.find(layout => layout.id === currentLayoutId) || layouts[0];
  }, [layouts, currentLayoutId]);

  // Auto-save layout to database when it changes (debounced)
  useEffect(() => {
    // Clear existing timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    // Skip auto-save if still loading or if user is not logged in
    if (isLoading) return;
    
    const userEmail = localStorage.getItem('userEmail');
    const projectKey = projectCode || sessionProjectCode || localStorage.getItem('projectCode');
    
    if (!userEmail || !projectKey) {
      console.log('Layouts: Cannot auto-save - missing userEmail or projectKey');
      return;
    }

    // Debounce auto-save by 2 seconds
    autoSaveTimerRef.current = setTimeout(async () => {
      const currentLayout = layouts.find(layout => layout.id === currentLayoutId) || layouts[0];
      
      // Don't save empty layouts
      if (!currentLayout || (currentLayout.placedPanels.length === 0 && currentLayout.placedDevices.length === 0 && !currentLayout.imageUrl)) {
        console.log('Layouts: Skipping auto-save - layout is empty');
        return;
      }

      console.log('Layouts: Auto-saving layout to database');
      
      try {
        // Convert image file to base64 if we have a file but no base64
        let imageBase64 = currentLayout.imageBase64;
        if (currentLayout.imageFile && !imageBase64) {
          try {
            imageBase64 = await fileToBase64(currentLayout.imageFile);
          } catch (error) {
            console.error('Layouts: Error converting image to base64:', error);
          }
        }
        
        // Prepare layout data for database
        const layoutData = {
          layoutName: currentLayout.name.trim() || 'Untitled Layout',
          projectName: currentLayout.name.trim() || 'Untitled Layout',
          projectCode: projectKey,
          location: sessionStorage.getItem('ppLocation') || '',
          operator: sessionStorage.getItem('ppOperator') || '',
          servicePartner: sessionStorage.getItem('ppServicePartner') || '',
          imageUrl: currentLayout.imageUrl,
          imageBase64: imageBase64 || currentLayout.imageUrl, // Store base64 if available
          imageScale: currentLayout.imageScale,
          imagePosition: currentLayout.imagePosition,
          imageFit: currentLayout.imageFit,
          placedPanels: currentLayout.placedPanels.map(panel => ({
            ...panel,
            panelSize: panelSizes[panel.id] || 40
          })),
          placedDevices: currentLayout.placedDevices.map(device => ({
            ...device,
            deviceSize: deviceSizes[device.id] || 24
          })),
          panelSizes: panelSizes,
          deviceSizes: deviceSizes,
          totalPanels: currentLayout.placedPanels.length,
          totalDevices: currentLayout.placedDevices.length,
          hasImage: !!currentLayout.imageUrl,
          lastModified: new Date().toISOString()
        };

        // If layout has databaseId, update it; otherwise create new
        if (currentLayout.databaseId) {
          const updateResult = await updateLayout(currentLayout.databaseId, userEmail, {
            layout_name: layoutData.layoutName,
            layout_data: layoutData
          });
          
          if (updateResult.success) {
            console.log('Layouts: Auto-saved layout (updated)');
          } else {
            console.error('Layouts: Auto-save failed (update):', updateResult.message);
          }
        } else {
          const saveResult = await saveLayout(userEmail, layoutData, projectKey);
          
          if (saveResult.success && saveResult.layoutId) {
            // Update the layout with the database ID
            setLayouts(prev => prev.map(layout =>
              layout.id === currentLayoutId
                ? { ...layout, databaseId: saveResult.layoutId, imageBase64: imageBase64 || layout.imageBase64 }
                : layout
            ));
            console.log('Layouts: Auto-saved layout (created)');
          } else {
            console.error('Layouts: Auto-save failed (create):', saveResult.message);
          }
        }
      } catch (error) {
        console.error('Layouts: Error during auto-save:', error);
      }
    }, 2000); // 2 second debounce

    // Cleanup timer on unmount or dependency change
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [layouts, currentLayoutId, panelSizes, deviceSizes, projectCode, sessionProjectCode, isLoading]);


  // Handle image upload
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && (file.type === 'image/png' || file.type === 'image/jpeg' || file.type === 'image/jpg')) {
      const url = URL.createObjectURL(file);
      try {
        // Convert to base64 for database storage
        const base64 = await fileToBase64(file);
        updateCurrentLayout({
          imageFile: file,
          imageUrl: url,
          imageBase64: base64
        });
      } catch (error) {
        console.error('Error converting image to base64:', error);
        // Still update with file and URL even if base64 conversion fails
        updateCurrentLayout({
          imageFile: file,
          imageUrl: url
        });
      }
    }
  };

  // Handle canvas click to place panel or device
  const handleCanvasClick = useCallback((event: React.MouseEvent) => {
    if (!canvasRef.current || draggedPanelId || draggedDeviceId || resizingPanelId || resizingDeviceId) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (isPlacingDevice && selectedDeviceType) {
      placeDevice(x, y);
      return;
    }

    if (!isPlacingPanel || selectedPanelIndex === null) return;

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
      
      const currentLayout = getCurrentLayout();
      updateCurrentLayout({
        placedPanels: [...currentLayout.placedPanels, newPlacedPanel]
      });
    }

    setIsPlacingPanel(false);
    setSelectedPanelIndex(null);
  }, [isPlacingPanel, isPlacingDevice, selectedPanelIndex, selectedDeviceType, selectedRoomType, projPanels, draggedPanelId, draggedDeviceId, resizingPanelId, resizingDeviceId]);

  // Remove placed panel
  const removePlacedPanel = (panelId: string) => {
    const currentLayout = getCurrentLayout();
    updateCurrentLayout({
      placedPanels: currentLayout.placedPanels.filter(panel => panel.id !== panelId)
    });
  };

  // Start placing panel
  const startPlacingPanel = (panelIndex: number) => {
    setSelectedPanelIndex(panelIndex);
    setIsPlacingPanel(true);
    setShowPanelSelector(false);
  };

  // Start dragging panel
  const startDragPanel = (e: React.MouseEvent, panelId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const currentLayout = getCurrentLayout();
    const panel = currentLayout.placedPanels.find(p => p.id === panelId);
    
    if (panel) {
      const offsetX = e.clientX - rect.left - panel.x;
      const offsetY = e.clientY - rect.top - panel.y;
      
      setDragOffset({ x: offsetX, y: offsetY });
      setDraggedPanelId(panelId);
    }
  };

  // Handle drag movement
  const handleDragMove = useCallback((e: MouseEvent) => {
    if (!draggedPanelId || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const newX = e.clientX - rect.left - dragOffset.x;
    const newY = e.clientY - rect.top - dragOffset.y;
    
    setLayouts(prev => prev.map(layout => 
      layout.id === currentLayoutId 
        ? {
            ...layout,
            placedPanels: layout.placedPanels.map(panel => 
              panel.id === draggedPanelId 
                ? { ...panel, x: newX, y: newY }
                : panel
            )
          }
        : layout
    ));
  }, [draggedPanelId, dragOffset, currentLayoutId]);

  // End dragging
  const endDrag = useCallback(() => {
    setDraggedPanelId(null);
    setDragOffset({ x: 0, y: 0 });
  }, []);

  // Add and remove global mouse event listeners
  useEffect(() => {
    if (draggedPanelId) {
      document.addEventListener('mousemove', handleDragMove);
      document.addEventListener('mouseup', endDrag);
      
      return () => {
        document.removeEventListener('mousemove', handleDragMove);
        document.removeEventListener('mouseup', endDrag);
      };
    }
  }, [draggedPanelId, handleDragMove, endDrag]);

  // Start resizing panel
  const startResizePanel = (e: React.MouseEvent, panelId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setResizingPanelId(panelId);
  };

  // Handle resize movement
  const handleResizeMove = useCallback((e: MouseEvent) => {
    if (!resizingPanelId || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    
    setLayouts(prev => prev.map(layout => {
      if (layout.id !== currentLayoutId) return layout;
      
      const panel = layout.placedPanels.find(p => p.id === resizingPanelId);
      if (!panel) return layout;
      
      const distance = Math.sqrt(
        Math.pow(e.clientX - rect.left - panel.x, 2) + 
        Math.pow(e.clientY - rect.top - panel.y, 2)
      );
      
      // Convert distance to size (minimum 24px, maximum 80px)
      const newSize = Math.max(24, Math.min(80, distance * 2));
      
      return {
        ...layout,
        panelSizes: {
          ...layout.panelSizes,
          [resizingPanelId]: newSize
        }
      };
    }));
  }, [resizingPanelId, currentLayoutId]);

  // End resizing
  const endResize = useCallback(() => {
    setResizingPanelId(null);
  }, []);

  // Add and remove global mouse event listeners for resize
  useEffect(() => {
    if (resizingPanelId) {
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', endResize);
      
      return () => {
        document.removeEventListener('mousemove', handleResizeMove);
        document.removeEventListener('mouseup', endResize);
      };
    }
  }, [resizingPanelId, handleResizeMove, endResize]);

  // Update current layout name when room type changes
  useEffect(() => {
    if (selectedRoomType && selectedRoomType.trim()) {
      setLayouts(prev => prev.map(layout => 
        layout.id === currentLayoutId 
          ? { ...layout, name: selectedRoomType }
          : layout
      ));
    }
  }, [selectedRoomType, currentLayoutId]);

  // Get room type color
  const getRoomTypeColor = (roomTypeName: string) => {
    // Generate a consistent color based on the room type name
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];
    const hash = roomTypeName.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return colors[Math.abs(hash) % colors.length];
  };

  // Get room type name
  const getRoomTypeName = (roomTypeName: string) => {
    return roomTypeName || 'Unknown';
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

  // Helper function to update current layout
  const updateCurrentLayout = (updates: Partial<typeof layouts[0]>) => {
    setLayouts(prev => prev.map(layout => 
      layout.id === currentLayoutId 
        ? { ...layout, ...updates }
        : layout
    ));
  };

  // Layout management functions
  const addNewLayout = () => {
    const newId = Date.now().toString();
    const newLayout = {
      id: newId,
      name: selectedRoomType || 'Untitled Layout',
      imageUrl: null,
      imageFile: null,
      imageScale: 1,
      imagePosition: { x: 0, y: 0 },
      imageFit: 'contain' as const,
      placedPanels: [],
      placedDevices: [],
      panelSizes: {}
    };
    setLayouts(prev => [...prev, newLayout]);
    setCurrentLayoutId(newId);
  };

  const deleteLayout = async (layoutId: string) => {
    if (layouts.length <= 1) return; // Don't delete the last layout
    
    const layoutToDelete = layouts.find(layout => layout.id === layoutId);
    
    // If layout has a databaseId, delete it from database
    if (layoutToDelete?.databaseId) {
      const userEmail = localStorage.getItem('userEmail');
      if (userEmail) {
        try {
          const result = await deleteLayoutApi(layoutToDelete.databaseId, userEmail);
          if (!result.success) {
            console.error('Failed to delete layout from database:', result.message);
            // Still delete from local state even if database delete fails
          }
        } catch (error) {
          console.error('Error deleting layout from database:', error);
          // Still delete from local state even if database delete fails
        }
      }
    }
    
    setLayouts(prev => prev.filter(layout => layout.id !== layoutId));
    
    // If we deleted the current layout, switch to the first available one
    if (currentLayoutId === layoutId) {
      const remainingLayouts = layouts.filter(layout => layout.id !== layoutId);
      setCurrentLayoutId(remainingLayouts[0]?.id || '1');
    }
  };

  const renameLayout = (layoutId: string, newName: string) => {
    setLayouts(prev => prev.map(layout => 
      layout.id === layoutId 
        ? { ...layout, name: newName }
        : layout
    ));
  };

  // Save layout function (manual save - same flow as panel designs)
  const handleSaveLayout = async () => {
    // Check if user is logged in
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
      setSaveError('Please log in first to save layouts.');
      return;
    }

    // Get current layout data
    const currentLayout = getCurrentLayout();
    
    // Validate that we have something to save
    if (currentLayout.placedPanels.length === 0 && currentLayout.placedDevices.length === 0 && !currentLayout.imageUrl) {
      setSaveError('Please add at least one panel, device, or image to the layout before saving.');
      return;
    }

    // Validate layout name
    if (!currentLayout.name || currentLayout.name.trim() === '') {
      setSaveError('Please enter a room type/name for the layout before saving.');
      return;
    }

    setIsSaving(true);
    setSaveError('');
    setSaveMessage('');

    try {
      const projectKey = projectCode || sessionProjectCode || localStorage.getItem('projectCode') || '';
      
      // Convert image file to base64 if we have a file but no base64
      let imageBase64 = currentLayout.imageBase64;
      if (currentLayout.imageFile && !imageBase64) {
        try {
          imageBase64 = await fileToBase64(currentLayout.imageFile);
        } catch (error) {
          console.error('Error converting image to base64:', error);
        }
      }
      
      // Prepare layout data for saving (same structure as panel designs)
      const layoutData = {
        layoutName: currentLayout.name.trim(),
        projectName: currentLayout.name.trim(),
        projectCode: projectKey,
        location: sessionStorage.getItem('ppLocation') || '',
        operator: sessionStorage.getItem('ppOperator') || '',
        servicePartner: sessionStorage.getItem('ppServicePartner') || '',
        // Layout-specific data
        imageUrl: currentLayout.imageUrl,
        imageBase64: imageBase64 || currentLayout.imageUrl,
        imageScale: currentLayout.imageScale,
        imagePosition: currentLayout.imagePosition,
        imageFit: currentLayout.imageFit,
        placedPanels: currentLayout.placedPanels.map(panel => ({
          ...panel,
          panelSize: panelSizes[panel.id] || 40
        })),
        placedDevices: currentLayout.placedDevices.map(device => ({
          ...device,
          deviceSize: deviceSizes[device.id] || 24
        })),
        panelSizes: panelSizes,
        deviceSizes: deviceSizes,
        totalPanels: currentLayout.placedPanels.length,
        totalDevices: currentLayout.placedDevices.length,
        hasImage: !!currentLayout.imageUrl,
        lastModified: new Date().toISOString()
      };

      // If layout has databaseId, update it; otherwise create new
      let result;
      if (currentLayout.databaseId) {
        result = await updateLayout(currentLayout.databaseId, userEmail, {
          layout_name: layoutData.layoutName,
          layout_data: layoutData
        });
        
        if (result.success) {
          setSaveMessage(`Layout "${currentLayout.name}" updated successfully!`);
          setSaveError('');
        } else {
          setSaveError(result.message || 'Failed to update layout');
        }
      } else {
        result = await saveLayout(userEmail, layoutData, projectKey);
        
        if (result.success && result.layoutId) {
          // Update the layout with the database ID
          setLayouts(prev => prev.map(layout =>
            layout.id === currentLayoutId
              ? { ...layout, databaseId: result.layoutId, imageBase64: imageBase64 || layout.imageBase64 }
              : layout
          ));
          setSaveMessage(`Layout "${currentLayout.name}" saved successfully!`);
          setSaveError('');
        } else {
          setSaveError(result.message || 'Failed to save layout');
        }
      }
    } catch (error) {
      console.error('Error saving layout:', error);
      setSaveError('An unexpected error occurred while saving the layout. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Layout functions removed - using auto-persistence instead


  // Device management functions
  const startPlacingDevice = (deviceType: string) => {
    setSelectedDeviceType(deviceType);
    setIsPlacingDevice(true);
    setIsPlacingPanel(false);
    setShowPanelSelector(false);
  };

  const placeDevice = (x: number, y: number) => {
    if (!selectedDeviceType) return;
    
    const newDevice: PlacedDevice = {
      id: Date.now().toString(),
      type: selectedDeviceType,
      x,
      y,
      roomType: selectedRoomType
    };
    
    const currentLayout = getCurrentLayout();
    updateCurrentLayout({
      placedDevices: [...currentLayout.placedDevices, newDevice]
    });
    
    // Initialize device size
    setDeviceSizes(prev => ({ ...prev, [newDevice.id]: 24 }));
    
    setIsPlacingDevice(false);
    setSelectedDeviceType(null);
  };

  const removeDevice = (deviceId: string) => {
    const currentLayout = getCurrentLayout();
    updateCurrentLayout({
      placedDevices: currentLayout.placedDevices.filter(device => device.id !== deviceId)
    });
  };

  // Start dragging device
  const startDragDevice = (e: React.MouseEvent, deviceId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const currentLayout = getCurrentLayout();
    const device = currentLayout.placedDevices.find(d => d.id === deviceId);
    
    if (device) {
      const offsetX = e.clientX - rect.left - device.x;
      const offsetY = e.clientY - rect.top - device.y;
      
      setDeviceDragOffset({ x: offsetX, y: offsetY });
      setDraggedDeviceId(deviceId);
    }
  };

  // Handle device drag movement
  const handleDeviceDragMove = useCallback((e: MouseEvent) => {
    if (!draggedDeviceId || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const newX = e.clientX - rect.left - deviceDragOffset.x;
    const newY = e.clientY - rect.top - deviceDragOffset.y;
    
    setLayouts(prev => prev.map(layout => 
      layout.id === currentLayoutId 
        ? {
            ...layout,
            placedDevices: layout.placedDevices.map(device => 
              device.id === draggedDeviceId 
                ? { ...device, x: newX, y: newY }
                : device
            )
          }
        : layout
    ));
  }, [draggedDeviceId, deviceDragOffset, currentLayoutId]);

  // End device dragging
  const endDeviceDrag = useCallback(() => {
    setDraggedDeviceId(null);
    setDeviceDragOffset({ x: 0, y: 0 });
  }, []);

  // Add and remove global mouse event listeners for device drag
  useEffect(() => {
    if (draggedDeviceId) {
      document.addEventListener('mousemove', handleDeviceDragMove);
      document.addEventListener('mouseup', endDeviceDrag);
      
      return () => {
        document.removeEventListener('mousemove', handleDeviceDragMove);
        document.removeEventListener('mouseup', endDeviceDrag);
      };
    }
  }, [draggedDeviceId, handleDeviceDragMove, endDeviceDrag]);

  // Start resizing device
  const startResizeDevice = (e: React.MouseEvent, deviceId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setResizingDeviceId(deviceId);
  };

  // Handle device resize movement
  const handleDeviceResizeMove = useCallback((e: MouseEvent) => {
    if (!resizingDeviceId || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const currentLayout = getCurrentLayout();
    const device = currentLayout.placedDevices.find(d => d.id === resizingDeviceId);
    
    if (device) {
      const distance = Math.sqrt(
        Math.pow(e.clientX - rect.left - device.x, 2) + 
        Math.pow(e.clientY - rect.top - device.y, 2)
      );
      
      const newSize = Math.max(16, Math.min(60, distance * 2));
      setDeviceSizes(prev => ({ ...prev, [resizingDeviceId]: newSize }));
    }
  }, [resizingDeviceId, getCurrentLayout]);

  // End device resizing
  const endDeviceResize = useCallback(() => {
    setResizingDeviceId(null);
  }, []);

  // Add and remove global mouse event listeners for device resize
  useEffect(() => {
    if (resizingDeviceId) {
      document.addEventListener('mousemove', handleDeviceResizeMove);
      document.addEventListener('mouseup', endDeviceResize);
      
      return () => {
        document.removeEventListener('mousemove', handleDeviceResizeMove);
        document.removeEventListener('mouseup', endDeviceResize);
      };
    }
  }, [resizingDeviceId, handleDeviceResizeMove, endDeviceResize]);

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

        {/* Layout Tabs */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 20,
          padding: '0 20px',
          overflowX: 'auto'
        }}>
          {layouts.map((layout) => (
            <div
              key={layout.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 16px',
                background: currentLayoutId === layout.id ? THEME.primary : '#f8f9fa',
                color: currentLayoutId === layout.id ? '#fff' : THEME.textSecondary,
                borderRadius: 8,
                cursor: 'pointer',
                border: currentLayoutId === layout.id ? 'none' : '1px solid #e0e0e0',
                fontSize: 14,
                fontWeight: currentLayoutId === layout.id ? 600 : 500,
                minWidth: 'fit-content',
                transition: 'all 0.2s ease'
              }}
              onClick={() => setCurrentLayoutId(layout.id)}
            >
              <span>{layout.name}</span>
              {layouts.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteLayout(layout.id);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'inherit',
                    cursor: 'pointer',
                    fontSize: 12,
                    padding: 0,
                    width: 16,
                    height: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    opacity: 0.7
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '1';
                    e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '0.7';
                    e.currentTarget.style.background = 'none';
                  }}
                >
                  ×
                </button>
              )}
            </div>
          ))}
          
          {/* Add New Layout Button */}
          <button
            onClick={addNewLayout}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              background: '#f8f9fa',
              border: '1px solid #e0e0e0',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 18,
              color: THEME.textSecondary,
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = THEME.primary;
              e.currentTarget.style.color = '#fff';
              e.currentTarget.style.borderColor = THEME.primary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f8f9fa';
              e.currentTarget.style.color = THEME.textSecondary;
              e.currentTarget.style.borderColor = '#e0e0e0';
            }}
          >
            +
          </button>
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
                accept=".png,.jpg,.jpeg"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
            </label>
            {getCurrentLayout().imageFile && (
              <span style={{ fontSize: 14, color: THEME.textSecondary }}>
                {getCurrentLayout().imageFile?.name}
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
            <input
              type="text"
              value={selectedRoomType}
              onChange={(e) => setSelectedRoomType(e.target.value)}
              placeholder="Enter room type..."
              style={{
                padding: '8px 12px',
                border: '1px solid #e0e0e0',
                borderRadius: 6,
                fontSize: 14,
                background: '#fff',
                color: THEME.textPrimary,
                minWidth: 120
              }}
            />
          </div>

          {/* Image Adjustment Controls */}
          {getCurrentLayout().imageUrl && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 15,
              padding: '10px 15px',
              background: '#f8f9fa',
              borderRadius: 8,
              border: '1px solid #e0e0e0'
            }}>
              <span style={{ fontSize: 14, color: THEME.textSecondary }}>Image Adjustments:</span>
              
              {/* Scale Control */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, color: THEME.textSecondary }}>Scale:</span>
                <input
                  type="range"
                  min="0.1"
                  max="3"
                  step="0.1"
                  value={getCurrentLayout().imageScale}
                  onChange={(e) => updateCurrentLayout({ imageScale: parseFloat(e.target.value) })}
                  style={{ width: 80 }}
                />
                <span style={{ fontSize: 12, color: THEME.textSecondary, minWidth: 30 }}>
                  {Math.round(getCurrentLayout().imageScale * 100)}%
                </span>
              </div>

              {/* Position Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, color: THEME.textSecondary }}>X:</span>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={getCurrentLayout().imagePosition.x}
                  onChange={(e) => updateCurrentLayout({ 
                    imagePosition: { ...getCurrentLayout().imagePosition, x: parseInt(e.target.value) }
                  })}
                  style={{ width: 60 }}
                />
                <span style={{ fontSize: 12, color: THEME.textSecondary, minWidth: 25 }}>
                  {getCurrentLayout().imagePosition.x}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, color: THEME.textSecondary }}>Y:</span>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={getCurrentLayout().imagePosition.y}
                  onChange={(e) => updateCurrentLayout({ 
                    imagePosition: { ...getCurrentLayout().imagePosition, y: parseInt(e.target.value) }
                  })}
                  style={{ width: 60 }}
                />
                <span style={{ fontSize: 12, color: THEME.textSecondary, minWidth: 25 }}>
                  {getCurrentLayout().imagePosition.y}
                </span>
              </div>

              {/* Fit Options */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 12, color: THEME.textSecondary }}>Fit:</span>
                <select
                  value={getCurrentLayout().imageFit}
                  onChange={(e) => updateCurrentLayout({ imageFit: e.target.value as 'cover' | 'contain' | 'fill' })}
                  style={{
                    padding: '4px 8px',
                    border: '1px solid #e0e0e0',
                    borderRadius: 4,
                    fontSize: 12,
                    background: '#fff'
                  }}
                >
                  <option value="contain">Contain</option>
                  <option value="cover">Cover</option>
                  <option value="fill">Fill</option>
            </select>
              </div>

              {/* Reset Button */}
            <button
                onClick={() => {
                  updateCurrentLayout({
                    imageScale: 1,
                    imagePosition: { x: 0, y: 0 },
                    imageFit: 'contain'
                  });
                }}
              style={{
                  padding: '4px 8px',
                background: THEME.secondary,
                color: '#fff',
                border: 'none',
                  borderRadius: 4,
                  fontSize: 12,
                  cursor: 'pointer'
                }}
              >
                Reset
            </button>
          </div>
          )}

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
            {isPlacingPanel ? 'Cancel Placement' : 'Place a Panel'}
          </button>

          {/* Field Devices Button */}
            <button
            onClick={() => setIsPlacingDevice(!isPlacingDevice)}
              style={{
              padding: '10px 20px',
              background: isPlacingDevice ? '#ff6b6b' : THEME.primary,
                color: '#fff',
                border: 'none',
              borderRadius: THEME.buttonRadius,
                fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.2s'
              }}
            >
            {isPlacingDevice ? 'Cancel Device' : 'Field Devices'}
            </button>
        </div>

        {/* Device Selector */}
        {isPlacingDevice && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: 20,
            gap: 15
          }}>
            {Object.entries(DEVICE_TYPES).map(([key, device]) => (
            <button
                key={key}
                onClick={() => startPlacingDevice(key)}
              style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                  padding: '12px 16px',
                  background: selectedDeviceType === key ? device.color : '#fff',
                  color: selectedDeviceType === key ? '#fff' : THEME.textPrimary,
                  border: `2px solid ${selectedDeviceType === key ? device.color : '#e0e0e0'}`,
                  borderRadius: THEME.borderRadius,
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                  minWidth: 80,
                  boxShadow: selectedDeviceType === key ? '0 2px 8px rgba(0,0,0,0.15)' : '0 1px 3px rgba(0,0,0,0.1)'
                }}
                onMouseEnter={(e) => {
                  if (selectedDeviceType !== key) {
                    e.currentTarget.style.background = device.color;
                    e.currentTarget.style.color = '#fff';
                    e.currentTarget.style.borderColor = device.color;
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedDeviceType !== key) {
                    e.currentTarget.style.background = '#fff';
                    e.currentTarget.style.color = THEME.textPrimary;
                    e.currentTarget.style.borderColor = '#e0e0e0';
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                <div style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  background: device.color,
                  border: '2px solid #fff',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }} />
                {device.name}
            </button>
            ))}
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
                            category: icon.category || '',
                            iconId: icon.iconId || undefined,
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
            {!getCurrentLayout().imageUrl ? (
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
                Upload a room plan image (PNG/JPG) to start designing
                <br />
                <small style={{ fontSize: 12, marginTop: 10, display: 'block' }}>
                  Layout state: {layouts.length} layouts, current: {currentLayoutId}
                </small>
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
                  cursor: isPlacingPanel || isPlacingDevice ? 'crosshair' : 'default',
                  overflow: 'hidden'
                }}
              >
                {/* Image Display */}
                <img
                  src={getCurrentLayout().imageUrl || ''}
                  alt="Room Plan"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: getCurrentLayout().imageFit,
                    transform: `scale(${getCurrentLayout().imageScale}) translate(${getCurrentLayout().imagePosition.x}px, ${getCurrentLayout().imagePosition.y}px)`,
                    transformOrigin: 'center center',
                    transition: 'transform 0.1s ease'
                  }}
                />
                
                {/* Placed Panels */}
                {getCurrentLayout().placedPanels.map(panel => (
                  <div
                    key={panel.id}
                    style={{
                      position: 'absolute',
                      left: panel.x - (getCurrentLayout().panelSizes[panel.id] || 36) / 2,
                      top: panel.y - (getCurrentLayout().panelSizes[panel.id] || 36) / 2,
                      width: getCurrentLayout().panelSizes[panel.id] || 36,
                      height: getCurrentLayout().panelSizes[panel.id] || 36,
                      cursor: 'pointer',
                      zIndex: 10
                    }}
                    onMouseEnter={() => setHoveredPanelId(panel.id)}
                    onMouseLeave={() => setHoveredPanelId(null)}
                  >
                    <div style={{
                      position: 'relative',
                      width: '100%',
                      height: '100%'
                    }}>
                      {/* Panel Number Circle */}
                      <div 
                        style={{
                          background: THEME.primary,
                          color: '#fff',
                          borderRadius: 8,
                          fontWeight: 700,
                          fontSize: Math.max(12, Math.min(24, (getCurrentLayout().panelSizes[panel.id] || 36) * 0.5)),
                          minWidth: getCurrentLayout().panelSizes[panel.id] || 36,
                          height: getCurrentLayout().panelSizes[panel.id] || 36,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 1px 4px rgba(27,146,209,0.10)',
                          border: 'none',
                          cursor: draggedPanelId === panel.id ? 'grabbing' : 'grab',
                          userSelect: 'none'
                        }}
                        onMouseDown={(e) => startDragPanel(e, panel.id)}
                      >
                        {panel.panelIndex + 1}
                      </div>
                      
                      {/* Resize Handle */}
                      {hoveredPanelId === panel.id && (
                        <div
                          style={{
                            position: 'absolute',
                            bottom: -6,
                            right: -6,
                            width: 12,
                            height: 12,
                            background: '#666',
                            borderRadius: '50%',
                            cursor: 'nw-resize',
                            border: '2px solid #fff',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                          }}
                          onMouseDown={(e) => startResizePanel(e, panel.id)}
                        />
                      )}
                      
                      {/* Delete Button */}
                      {hoveredPanelId === panel.id && (
                      <button
                        onClick={() => removePlacedPanel(panel.id)}
                        style={{
                          position: 'absolute',
                            top: -6,
                            right: -6,
                            width: 16,
                            height: 16,
                          borderRadius: '50%',
                          background: '#ff6b6b',
                          color: '#fff',
                          border: 'none',
                          cursor: 'pointer',
                            fontSize: 10,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                            padding: 0,
                            lineHeight: 1
                        }}
                      >
                        ×
                      </button>
            )}
          </div>
        </div>
                ))}

                {/* Placed Devices */}
                {getCurrentLayout().placedDevices.map(device => (
                  <div
                    key={device.id}
                style={{
                      position: 'absolute',
                      left: device.x - (deviceSizes[device.id] || 24) / 2,
                      top: device.y - (deviceSizes[device.id] || 24) / 2,
                      width: deviceSizes[device.id] || 24,
                      height: deviceSizes[device.id] || 24,
                      cursor: 'pointer',
                      zIndex: 10
                    }}
                    onMouseEnter={() => setHoveredPanelId(device.id)}
                    onMouseLeave={() => setHoveredPanelId(null)}
              >
                <div style={{
                      position: 'relative',
                      width: '100%',
                      height: '100%'
                    }}>
                      {/* Device Circle */}
                      <div 
                        style={{
                          width: '100%',
                          height: '100%',
                          borderRadius: '50%',
                          background: DEVICE_TYPES[device.type as keyof typeof DEVICE_TYPES]?.color || '#666',
                          border: '2px solid #fff',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                          cursor: draggedDeviceId === device.id ? 'grabbing' : 'grab',
                          userSelect: 'none'
                        }}
                        onMouseDown={(e) => startDragDevice(e, device.id)}
                      />
                      
                      {/* Resize Handle */}
                      {hoveredPanelId === device.id && (
                        <div
                          style={{
                            position: 'absolute',
                            bottom: -6,
                            right: -6,
                  width: 12,
                  height: 12,
                            background: '#666',
                  borderRadius: '50%',
                            cursor: 'nw-resize',
                            border: '2px solid #fff',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                          }}
                          onMouseDown={(e) => startResizeDevice(e, device.id)}
                        />
                      )}
                      
                      {/* Delete Button */}
                      {hoveredPanelId === device.id && (
                        <button
                          onClick={() => removeDevice(device.id)}
                          style={{
                            position: 'absolute',
                            top: -6,
                            right: -6,
                            width: 16,
                            height: 16,
                            borderRadius: '50%',
                            background: '#ff6b6b',
                            color: '#fff',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: 10,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                            padding: 0,
                            lineHeight: 1
                          }}
                        >
                          ×
                        </button>
                      )}
                    </div>
              </div>
            ))}
              </div>
            )}
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
            onClick={() => navigate("/proj-panels")}
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
            onClick={handleSaveLayout}
            disabled={isSaving}
            style={{
              padding: '12px 24px',
              background: isSaving ? THEME.secondary : THEME.primary,
              color: '#fff',
              border: 'none',
              borderRadius: THEME.buttonRadius,
              fontSize: 16,
              fontWeight: 600,
              cursor: isSaving ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              opacity: isSaving ? 0.7 : 1
            }}
          >
            <Save fontSize="small" />
            {isSaving ? 'Saving...' : 'Save Layout'}
          </button>
          
          
        </div>


        {/* Save Status Messages */}
        {(saveMessage || saveError) && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: '20px'
          }}>
            <div style={{
              padding: '12px 20px',
              borderRadius: THEME.buttonRadius,
              fontSize: 14,
              fontWeight: 500,
              maxWidth: '400px',
              textAlign: 'center',
              background: saveMessage ? '#d4edda' : '#f8d7da',
              color: saveMessage ? '#155724' : '#721c24',
              border: `1px solid ${saveMessage ? '#c3e6cb' : '#f5c6cb'}`
            }}>
              {saveMessage || saveError}
            </div>
          </div>
        )}


        {/* Property Selector (only if not auto-bound and multiple choices exist) */}
        {(() => {
          const isAutoBound = Boolean((projectCode && projectCode.trim()) || (sessionProjectCode && sessionProjectCode.trim()));
          const shouldShowSelector = !isAutoBound && accessibleProperties.length > 1;
          if (!shouldShowSelector) return null;
          return (
            <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 14, color: '#555' }}>Property:</span>
                <select
                  value={selectedPropId}
                  onChange={(e) => setSelectedPropId(e.target.value)}
                  style={{ padding: '6px 10px', border: '1px solid #ddd', borderRadius: 4 }}
                >
                  <option value="" disabled>Select a property…</option>
                  {accessibleProperties.map((p) => (
                    <option key={p.prop_id} value={p.prop_id}>
                      {p.property_name} — {p.region} ({p.prop_id})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          );
        })()}

      </div>
    </div>
  );
};

export default Layouts; 