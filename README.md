# WEBSITE2_NEW

A React application built with Vite and TypeScript.

## Local Development

```bash
npm install
# run frontend
npm run dev
# run backend (in another terminal)
npm run server
```

Backend runs at `http://localhost:5001` by default. Health check at `GET /health`.

### Environment Variables
Create a `.env` file in the project root for the backend server with:

```
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
EMAIL_API_KEY=your_sendgrid_api_key
EMAIL_FROM=no-reply@example.com
PORT=5001
```

- `SUPABASE_SERVICE_KEY` should be the service role key (keep it server-side only).
- `EMAIL_API_KEY` is used with SendGrid SMTP via Nodemailer.

### Endpoints
- `GET /health` → `{ ok: true, time: ... }`
- `POST /notify` JSON body `{ to, subject, text }` → sends an email using Nodemailer.

### Testing from the UI
A small button “Send Test Email” was added to the `AdminDashboard`. It calls the backend `POST /notify` with test data.

## Deployment

### Frontend (Netlify)
The existing instructions below still apply for deploying the static frontend.

### Backend (Render or Railway)
You can deploy the `server/` directory as a Node service.

- Start command: `node server/index.js`
- Environment variables: `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `EMAIL_API_KEY`, `EMAIL_FROM`, `PORT` (Render/Railway usually set their own `PORT`)
- Make sure to allow the deployed backend URL in CORS if you later restrict it

After deploy, update your frontend to call that backend URL (currently the helper defaults to `http://localhost:5001`). You can pass a different base URL to the client helper if needed.

### Vercel (Serverless alternative)
Optionally convert `server/index.js` routes into API functions under `api/` if deploying to Vercel. For now this project uses a simple Express server which is best suited to Render/Railway/Fly.io.

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