import { NavigateFunction } from 'react-router-dom';

export interface PanelConfig {
  icons: Array<{
    src: string;
    label: string;
    position: number;
    text: string;
    category?: string;
    id?: string;
    iconId?: string;
  }>;
  panelDesign: {
    backgroundColor: string;
    iconColor: string;
    textColor: string;
    fontSize: string;
    iconSize?: string;
    fonts?: string;
    isLayoutReversed?: boolean;
    swapSides?: boolean;
    mirrorGrid?: boolean;
    swapUpDown?: boolean;
    mirrorVertical?: boolean;
    idpgConfig?: {
      cardReader: boolean;
      roomNumber: boolean;
      statusMode: 'bar' | 'icons';
      selectedIcon1: string;
      roomNumberText: string;
    };
    spConfig?: {
      dimension: 'standard' | 'wide' | 'tall';
    };
  };
  iconTexts?: { [key: number]: string };
  type?: string;
  name?: string;
}

/**
 * Navigate to PDF preview with a single panel
 */
export const navigateToPrintPreview = (
  navigate: NavigateFunction,
  panelConfig: PanelConfig,
  projectName?: string
) => {
  navigate('/print-preview', {
    state: {
      panelConfig,
      projectName: projectName || 'Panel Design'
    }
  });
};

/**
 * Navigate to PDF preview with multiple panels
 */
export const navigateToPrintPreviewMultiple = (
  navigate: NavigateFunction,
  panelConfigs: PanelConfig[],
  projectName?: string,
  projectCode?: string,
  roomType?: string,
  revision?: string
) => {
  navigate('/print-preview', {
    state: {
      panelConfigs,
      projectName: projectName || 'Project Design',
      projectCode: projectCode || 'PRJ-001',
      roomType: roomType || 'General',
      revision: revision || 'Rev0'
    }
  });
};

/**
 * Generate a URL for print preview that can be shared
 */
export const generatePrintPreviewURL = (
  panelConfig: PanelConfig | PanelConfig[],
  projectName?: string
): string => {
  const baseURL = window.location.origin + '/print-preview';
  const params = new URLSearchParams();
  
  params.set('config', encodeURIComponent(JSON.stringify(panelConfig)));
  if (projectName) {
    params.set('project', encodeURIComponent(projectName));
  }
  
  return `${baseURL}?${params.toString()}`;
};

/**
 * Open print preview in a new window/tab
 */
export const openPrintPreviewInNewWindow = (
  panelConfig: PanelConfig | PanelConfig[],
  projectName?: string
) => {
  const url = generatePrintPreviewURL(panelConfig, projectName);
  window.open(url, '_blank');
};
