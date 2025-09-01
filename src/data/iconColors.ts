export const ICON_COLOR_NAMES: { [key: string]: string } = {
  '#000000': 'Black',
  '#FFFFFF': 'White',
  '#808080': 'Gray',
  '#333333': 'Dark Grey',
  '#555555': 'Dark Grey',
  '#FF0000': 'Red',
  '#0000FF': 'Blue',
  '#008000': 'Green',
};

export const getIconColorName = (hexColor: string): string => {
  return ICON_COLOR_NAMES[hexColor] || hexColor;
}; 