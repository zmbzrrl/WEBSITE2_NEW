# WEBSITE2_NEW

A React application built with Vite and TypeScript.

## Local Development

```bash
npm install
npm run dev
```

## Deployment to Netlify

### Option 1: Deploy via Netlify UI (Recommended)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for Netlify deployment"
   git push origin main
   ```

2. **Connect to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Sign up/Login with your GitHub account
   - Click "New site from Git"
   - Choose GitHub and select your repository: `zmbzrrl/WEBSITE2_NEW`
   - Configure build settings:
     - **Build command**: `npm run build`
     - **Publish directory**: `dist`
   - Click "Deploy site"

### Option 2: Deploy via Netlify CLI

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**
   ```bash
   netlify login
   ```

3. **Deploy**
   ```bash
   npm run build
   netlify deploy --prod --dir=dist
   ```

### Option 3: Drag and Drop

1. **Build your project**
   ```bash
   npm run build
   ```

2. **Deploy**
   - Go to [netlify.com](https://netlify.com)
   - Drag and drop the `dist` folder to the deploy area

## Configuration

The project includes:
- `netlify.toml` - Netlify configuration with build settings and redirects
- Optimized Vite config for production builds
- SPA routing support (all routes redirect to index.html)

## Features

- React 18 with TypeScript
- Vite for fast development and optimized builds
- Material-UI components
- React Router for navigation
- Framer Motion for animations
- Responsive design

## Build Output

The build process creates a `dist` folder containing:
- Optimized JavaScript bundles
- Minified CSS
- Static assets
- `index.html` with proper asset references 