export const DEFAULT_PANELS = [
  {
    type: 'SP',
    icons: [
      { iconId: 'B-1', label: 'B-1', position: 0, text: 'Light', src: '/src/assets/icons/B-Roomlights/B-1.png', category: 'Room Lights' },
      { iconId: 'FAN', label: 'FAN', position: 1, text: 'Fan', src: '/src/assets/icons/FAN.png', category: 'TAG' },
      { iconId: '20209', label: '20209', position: 2, text: 'Socket', src: '/src/assets/sockets/20209.png', category: 'Sockets' },
    ],
    quantity: 1,
    displayNumber: 1,
    panelName: 'Single Panel',
    panelDesign: {
      backgroundColor: '#CDBA88',
      iconColor: '#000000',
      textColor: '#000000',
      fontSize: '14px',
      fonts: 'Arial',
    },
  },
  {
    type: 'TAG',
    icons: [
      { iconId: 'DISPLAY', label: 'DISPLAY', position: 0, text: 'Thermostat', src: '/src/assets/icons/DISPLAY.png', category: 'TAG' },
    ],
    quantity: 1,
    displayNumber: 2,
    panelName: 'Thermostat',
    panelDesign: {
      backgroundColor: '#D0B084',
      iconColor: '#000000',
      textColor: '#000000',
      fontSize: '14px',
      fonts: 'Arial',
    },
  },
  {
    type: 'DPH',
    icons: [
      { iconId: 'B-2', label: 'B-2', position: 0, text: 'Light', src: '/src/assets/icons/B-Roomlights/B-2.png', category: 'Room Lights' },
      { iconId: 'FAN', label: 'FAN', position: 1, text: 'Fan', src: '/src/assets/icons/FAN.png', category: 'TAG' },
    ],
    quantity: 1,
    displayNumber: 3,
    panelName: 'Double Panel - H',
    panelDesign: {
      backgroundColor: '#D2AA6D',
      iconColor: '#000000',
      textColor: '#000000',
      fontSize: '14px',
      fonts: 'Arial',
    },
  },
  {
    type: 'DPV',
    icons: [
      { iconId: 'B-3', label: 'B-3', position: 0, text: 'Light', src: '/src/assets/icons/B-Roomlights/B-3.png', category: 'Room Lights' },
      { iconId: 'FAN', label: 'FAN', position: 1, text: 'Fan', src: '/src/assets/icons/FAN.png', category: 'TAG' },
    ],
    quantity: 1,
    displayNumber: 4,
    panelName: 'Double Panel - V',
    panelDesign: {
      backgroundColor: '#F9A900',
      iconColor: '#000000',
      textColor: '#000000',
      fontSize: '14px',
      fonts: 'Arial',
    },
  },
  {
    type: 'X1H',
    icons: [
      { iconId: 'B-4', label: 'B-4', position: 0, text: 'Light', src: '/src/assets/icons/B-Roomlights/B-4.png', category: 'Room Lights' },
      { iconId: 'FAN', label: 'FAN', position: 1, text: 'Fan', src: '/src/assets/icons/FAN.png', category: 'TAG' },
      { iconId: '20209', label: '20209', position: 100, text: 'Socket', src: '/src/assets/sockets/20209.png', category: 'Sockets' },
    ],
    quantity: 1,
    displayNumber: 5,
    panelName: 'Extended Panel - H1',
    panelDesign: {
      backgroundColor: '#E49E00',
      iconColor: '#000000',
      textColor: '#000000',
      fontSize: '14px',
      fonts: 'Arial',
    },
  },
]; 