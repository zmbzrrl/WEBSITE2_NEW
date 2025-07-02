export const DEFAULT_PANELS = [
  {
    type: 'SP',
    icons: [
      { iconId: 'light', label: 'Light', position: 0, text: 'Light', src: '/src/assets/icons/light.png', category: 'Light' },
      { iconId: 'fan', label: 'Fan', position: 1, text: 'Fan', src: '/src/assets/icons/fan.png', category: 'Fan' },
      { iconId: 'socket', label: 'Socket', position: 2, text: 'Socket', src: '/src/assets/icons/socket.png', category: 'Socket' },
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
      { iconId: 'thermostat', label: 'Thermostat', position: 0, text: 'Thermostat', src: '/src/assets/icons/thermostat.png', category: 'Thermostat' },
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
      { iconId: 'light', label: 'Light', position: 0, text: 'Light', src: '/src/assets/icons/light.png', category: 'Light' },
      { iconId: 'fan', label: 'Fan', position: 1, text: 'Fan', src: '/src/assets/icons/fan.png', category: 'Fan' },
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
      { iconId: 'light', label: 'Light', position: 0, text: 'Light', src: '/src/assets/icons/light.png', category: 'Light' },
      { iconId: 'fan', label: 'Fan', position: 1, text: 'Fan', src: '/src/assets/icons/fan.png', category: 'Fan' },
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
      { iconId: 'light', label: 'Light', position: 0, text: 'Light', src: '/src/assets/icons/light.png', category: 'Light' },
      { iconId: 'fan', label: 'Fan', position: 1, text: 'Fan', src: '/src/assets/icons/fan.png', category: 'Fan' },
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