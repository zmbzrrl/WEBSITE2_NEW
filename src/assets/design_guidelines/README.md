# Design Guidelines Images

This folder contains images that will be displayed when users click on "Read INTEREL's Design Guidelines" on the home page.

## How to Add Images

1. **Supported Formats**: PNG, JPG, SVG
2. **File Naming**: Use descriptive names like `guideline1.png`, `color-scheme.jpg`, etc.
3. **Image Size**: Recommended size is around 400x300 pixels for optimal display

## Adding Images to the Component

After adding images to this folder, you need to update the `DesignGuidelines.tsx` component:

1. Open `src/components/DesignGuidelines.tsx`
2. Add an import for your new image:
   ```typescript
   import guideline1 from '../assets/design_guidelines/guideline1.png';
   import newImage from '../assets/design_guidelines/your-new-image.png';
   ```
3. Add the image to the `designGuidelinesImages` array:
   ```typescript
   const designGuidelinesImages = [
     guideline1,
     newImage
   ];
   ```

## Current Images

- `guideline1.png` - Sample design guideline image

## Features

- **Responsive Grid**: Images are displayed in a responsive grid layout
- **Hover Effects**: Images have subtle hover animations
- **Modal Display**: Images are shown in a full-screen modal dialog
- **Close Button**: Users can close the modal with the X button or by clicking outside
